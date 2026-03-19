"use client";

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Upload, Send, FileText, CheckCircle2, Loader2 } from 'lucide-react';
import { createClient } from '@/utils/supabase/client';
import styles from '@/app/hazte-profesor/page.module.css';

const formSchema = z.object({
  title: z.string().min(5, "El título debe tener al menos 5 caracteres"),
  documentType: z.string().min(1, "Selecciona un tipo de documento"),
  institution: z.string().min(3, "La institución debe tener al menos 3 caracteres"),
});

type FormValues = z.infer<typeof formSchema>;

export default function CertificationForm() {
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [isDone, setIsDone] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [validationResult, setValidationResult] = useState<{status: string, score: number, reason?: string} | null>(null);
  const supabase = createClient();

  const getBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve((reader.result as string).split(',')[1]);
      reader.onerror = error => reject(error);
    });
  };

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset
  } = useForm<FormValues>({
    resolver: zodResolver(formSchema),
  });

  useEffect(() => {
    const checkUserRole = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) {
        const { data: usuario } = await supabase
          .from('usuarios')
          .select('rol')
          .eq('id', session.user.id)
          .single();
        
        if (usuario?.rol === 'profesor_pendiente') {
          setIsDone(true);
          setValidationResult({ status: 'pending', score: 0, reason: 'Ya tienes una solicitud en proceso de verificación manual.' });
        } else if (usuario?.rol === 'profesor') {
          setIsDone(true);
          setValidationResult({ status: 'approved', score: 100, reason: 'Tu cuenta ya está habilitada al 100% como Profesor. Accede a las herramientas de Educación desde tu menú lateral.' });
        }
      }
    };

    checkUserRole();
  }, [supabase]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0];
      if (selectedFile.size > 10 * 1024 * 1024) {
        setError("El archivo supera los 10MB permitidos");
        return;
      }
      setFile(selectedFile);
      setError(null);
    }
  };

  const onSubmit = async (data: FormValues) => {
    if (!file) {
      setError("Debes subir un documento de certificación");
      return;
    }

    setUploading(true);
    setError(null);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Usuario no autenticado");

      // 1. Upload file to Supabase Storage
      const fileExt = file.name.split('.').pop();
      const fileName = `${user.id}/${Date.now()}.${fileExt}`;
      const filePath = `certifications/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('teacher-certifications')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      // Get public URL (or signed URL if bucket is private, but for now we follow prompt for secure URL)
      const { data: { publicUrl } } = supabase.storage
        .from('teacher-certifications')
        .getPublicUrl(filePath);

      // 2. AI Validation (Paso B)
      const base64Data = await getBase64(file);
      const mimeType = file.type;

      const aiResponse = await fetch('/api/validate-certificate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ documentBase64: base64Data, mimeType })
      });

      const aiData = await aiResponse.json();
      
      let p_status = 'pending';
      let p_role = 'profesor_pendiente';
      let confidenceScore = 0;

      if (aiResponse.ok && aiData.confidenceScore !== undefined) {
        confidenceScore = aiData.confidenceScore;
        // Paso C: Decision inteligente
        if (confidenceScore >= 85) {
          p_status = 'approved';
          p_role = 'profesor';
        }
      } else {
        console.warn("AI Validation failed, falling back to manual review:", aiData.error);
      }

      // 3. Submit application and update role (using the new AI RPC function)
      const { error: rpcError } = await supabase.rpc('submit_teacher_application_ai', {
        p_document_title: data.title,
        p_document_type: data.documentType,
        p_issuing_institution: data.institution,
        p_document_url: publicUrl,
        p_status,
        p_role
      });

      if (rpcError) throw rpcError;

      setIsDone(true);
      setValidationResult({ status: p_status, score: confidenceScore, reason: aiData.reason });
      reset();
      setFile(null);
    } catch (err: any) {
      console.error(err);
      setError(err.message || "Ocurrió un error al enviar la postulación");
    } finally {
      setUploading(false);
    }
  };

  if (isDone) {
    return (
      <div className={styles.dropzoneContainer} style={{ cursor: 'default' }}>
        <div className={styles.cloudIcon} style={{ background: '#00c853' }}>
          <CheckCircle2 size={32} />
        </div>
        <h2 className={styles.title} style={{ color: validationResult?.status === 'approved' ? '#00ffcc' : undefined }}>
          {validationResult?.status === 'approved' ? '¡Felicidades, tu certificado ha sido validado!' : 'Recibido. Estamos validando tu documento.'}
        </h2>
        <p className={styles.subtitle}>
          {validationResult?.status === 'approved' 
            ? 'La Inteligencia Artificial ha verificado tu documento con éxito. Ya tienes acceso al panel de Profesor.' 
            : <>Tu perfil ahora está en estado <span style={{ color: '#ff007a', fontWeight: 'bold' }}>Profesor Pendiente</span>. Revisaremos tus documentos y te notificaremos pronto.</>}
        </p>

        {validationResult && (
          <div style={{
            marginTop: '1.5rem',
            padding: '1rem',
            borderRadius: '12px',
            border: validationResult.status === 'approved' ? '2px solid #00ffcc' : '2px solid #ff007a',
            backgroundColor: 'rgba(0,0,0,0.5)',
            boxShadow: validationResult.status === 'approved' ? '0 0 15px rgba(0,255,204,0.3)' : '0 0 15px rgba(255,0,122,0.3)'
          }}>
            <p style={{ margin: 0, fontWeight: 'bold', color: validationResult.status === 'approved' ? '#00ffcc' : '#ff007a' }}>
              Gemini AI Score: {validationResult.score}%
            </p>
            {validationResult.reason && (
              <p style={{ margin: '0.5rem 0 0', fontSize: '0.9rem', color: '#ccc' }}>
                {validationResult.reason}
              </p>
            )}
          </div>
        )}
        <button 
          className={styles.submitBtn} 
          onClick={() => window.location.href = '/'}
          style={{ maxWidth: '200px', margin: '1rem auto' }}
        >
          Volver al Inicio
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <div 
        className={`${styles.dropzoneContainer} ${file ? styles.dropzoneActive : ''}`}
        onClick={() => document.getElementById('fileInput')?.click()}
      >
        <input 
          type="file" 
          id="fileInput" 
          hidden 
          accept=".pdf,.jpg,.jpeg,.png"
          onChange={handleFileChange}
        />
        <div className={styles.cloudIcon}>
          <Upload size={32} />
        </div>
        <p className={styles.dropzoneTitle}>
          {file ? file.name : "Arrastra tu archivo aquí"}
        </p>
        <p className={styles.dropzoneSubtitle}>
          o haz clic para seleccionar archivos de tu dispositivo
        </p>
        <div className={styles.formatPills}>
          <span className={styles.formatPill}>PDF</span>
          <span className={styles.formatPill}>JPG</span>
          <span className={styles.formatPill}>PNG</span>
        </div>
      </div>

      <div className={styles.formGroup}>
        <label className={styles.label}>Título Profesional / Certificación</label>
        <input 
          {...register('title')}
          className={styles.input}
          placeholder="Ej: Licenciatura en Música, Certificado Berklee..."
        />
        {errors.title && <p className={styles.errorText}>{errors.title.message}</p>}
      </div>

      <div className={styles.formGroup}>
        <label className={styles.label}>Tipo de Documento</label>
        <select {...register('documentType')} className={styles.select}>
          <option value="">Selecciona una opción</option>
          <option value="titulo">Título Académico</option>
          <option value="diploma">Diploma / Certificado</option>
          <option value="licencia">Licencia de Enseñanza</option>
          <option value="otro">Otro</option>
        </select>
        {errors.documentType && <p className={styles.errorText}>{errors.documentType.message}</p>}
      </div>

      <div className={styles.formGroup}>
        <label className={styles.label}>Institución Emisora</label>
        <input 
          {...register('institution')}
          className={styles.input}
          placeholder="Nombre de la universidad o academia"
        />
        {errors.institution && <p className={styles.errorText}>{errors.institution.message}</p>}
      </div>

      {error && <p className={styles.errorText} style={{ marginBottom: '1rem', textAlign: 'center' }}>{error}</p>}

      <button 
        type="submit" 
        className={styles.submitBtn}
        disabled={uploading}
      >
        {uploading ? (
          <>
            <Loader2 className="animate-spin" size={20} />
            Enviando...
          </>
        ) : (
          <>
            <Send size={20} />
            Guardar y Enviar
          </>
        )}
      </button>
    </form>
  );
}
