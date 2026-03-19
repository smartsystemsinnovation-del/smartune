"use client";

import { useState } from 'react';
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
  const supabase = createClient();

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset
  } = useForm<FormValues>({
    resolver: zodResolver(formSchema),
  });

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

      // 2. Submit application and update role (using the RPC function we created in SQL)
      const { error: rpcError } = await supabase.rpc('submit_teacher_application', {
        p_document_title: data.title,
        p_document_type: data.documentType,
        p_issuing_institution: data.institution,
        p_document_url: publicUrl,
      });

      if (rpcError) throw rpcError;

      setIsDone(true);
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
        <h2 className={styles.title}>¡Solicitud Enviada!</h2>
        <p className={styles.subtitle}>
          Tu perfil ahora está en estado <span style={{ color: '#ff007a', fontWeight: 'bold' }}>Profesor Pendiente</span>. 
          Revisaremos tus documentos y te notificaremos pronto.
        </p>
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
