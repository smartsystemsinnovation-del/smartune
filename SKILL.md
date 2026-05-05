# Vektoraq - Global Project Rules & Architecture

## Core Tech Stack
- **Frontend**: Next.js (Strict usage for all web dashboards and visualizations).
- **Backend**: Supabase with pgvector (Storage, Authentication, and Vector Similarity Search).
- **Mobile**: Native Java with TensorFlow Lite (Edge AI for local inference and anomaly detection).

## Documentation Policy
- **Primary Author**: Luis Uziel Gutierrez Zamora. (This must be strictly adhered to in all technical reports, whitepapers, and system documentation).

## Architectural Principles
1. **Edge-First Intelligence**: Machine Learning models must run locally on mobile devices using TFLite to ensure offline functionality and rapid response to water anomalies.
2. **Geospatial & Vector Search**: Utilize Supabase `pgvector` for efficient querying of hydrological data patterns and spatial anomalies.
3. **Data Integrity**: Ensure end-to-end encryption and compliance with water conservation data standards.
