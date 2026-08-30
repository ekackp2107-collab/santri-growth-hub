export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.5"
  }
  public: {
    Tables: {
      achievement_categories: {
        Row: {
          aktif: boolean
          dimension: string
          id: string
          nama: string
        }
        Insert: {
          aktif?: boolean
          dimension?: string
          id?: string
          nama: string
        }
        Update: {
          aktif?: boolean
          dimension?: string
          id?: string
          nama?: string
        }
        Relationships: []
      }
      achievement_levels: {
        Row: {
          aktif: boolean
          id: string
          nama: string
          points: number
          urutan: number
        }
        Insert: {
          aktif?: boolean
          id?: string
          nama: string
          points?: number
          urutan?: number
        }
        Update: {
          aktif?: boolean
          id?: string
          nama?: string
          points?: number
          urutan?: number
        }
        Relationships: []
      }
      achievements: {
        Row: {
          category_id: string | null
          coach: string | null
          created_at: string
          created_by: string | null
          deskripsi: string | null
          event_name: string
          hasil: string | null
          id: string
          level_id: string | null
          organizer: string | null
          points: number
          santri_id: string
          tanggal: string
          updated_at: string
        }
        Insert: {
          category_id?: string | null
          coach?: string | null
          created_at?: string
          created_by?: string | null
          deskripsi?: string | null
          event_name: string
          hasil?: string | null
          id?: string
          level_id?: string | null
          organizer?: string | null
          points?: number
          santri_id: string
          tanggal?: string
          updated_at?: string
        }
        Update: {
          category_id?: string | null
          coach?: string | null
          created_at?: string
          created_by?: string | null
          deskripsi?: string | null
          event_name?: string
          hasil?: string | null
          id?: string
          level_id?: string | null
          organizer?: string | null
          points?: number
          santri_id?: string
          tanggal?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "achievements_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "achievement_categories"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "achievements_level_id_fkey"
            columns: ["level_id"]
            isOneToOne: false
            referencedRelation: "achievement_levels"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "achievements_santri_id_fkey"
            columns: ["santri_id"]
            isOneToOne: false
            referencedRelation: "santri"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "achievements_santri_id_fkey"
            columns: ["santri_id"]
            isOneToOne: false
            referencedRelation: "v_santri_overview"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "achievements_santri_id_fkey"
            columns: ["santri_id"]
            isOneToOne: false
            referencedRelation: "v_santri_scores"
            referencedColumns: ["santri_id"]
          },
        ]
      }
      activity_logs: {
        Row: {
          action: string
          actor_id: string | null
          created_at: string
          entity: string
          entity_id: string | null
          id: string
          metadata: Json
        }
        Insert: {
          action: string
          actor_id?: string | null
          created_at?: string
          entity: string
          entity_id?: string | null
          id?: string
          metadata?: Json
        }
        Update: {
          action?: string
          actor_id?: string | null
          created_at?: string
          entity?: string
          entity_id?: string | null
          id?: string
          metadata?: Json
        }
        Relationships: []
      }
      asrama: {
        Row: {
          aktif: boolean
          created_at: string
          id: string
          nama: string
        }
        Insert: {
          aktif?: boolean
          created_at?: string
          id?: string
          nama: string
        }
        Update: {
          aktif?: boolean
          created_at?: string
          id?: string
          nama?: string
        }
        Relationships: []
      }
      attachments: {
        Row: {
          created_at: string
          entity_id: string
          entity_type: string
          id: string
          mime_type: string | null
          path: string
          size_bytes: number | null
          uploaded_by: string | null
        }
        Insert: {
          created_at?: string
          entity_id: string
          entity_type: string
          id?: string
          mime_type?: string | null
          path: string
          size_bytes?: number | null
          uploaded_by?: string | null
        }
        Update: {
          created_at?: string
          entity_id?: string
          entity_type?: string
          id?: string
          mime_type?: string | null
          path?: string
          size_bytes?: number | null
          uploaded_by?: string | null
        }
        Relationships: []
      }
      early_warning_rules: {
        Row: {
          aktif: boolean
          deskripsi: string | null
          id: string
          kode: string
          metric: string
          nama: string
          severity: string
          threshold: number
          window_days: number
        }
        Insert: {
          aktif?: boolean
          deskripsi?: string | null
          id?: string
          kode: string
          metric: string
          nama: string
          severity?: string
          threshold: number
          window_days?: number
        }
        Update: {
          aktif?: boolean
          deskripsi?: string | null
          id?: string
          kode?: string
          metric?: string
          nama?: string
          severity?: string
          threshold?: number
          window_days?: number
        }
        Relationships: []
      }
      early_warnings: {
        Row: {
          created_at: string
          id: string
          reason: string
          reviewed_at: string | null
          reviewed_by: string | null
          rule_id: string | null
          santri_id: string
          severity: string
          status: string
        }
        Insert: {
          created_at?: string
          id?: string
          reason: string
          reviewed_at?: string | null
          reviewed_by?: string | null
          rule_id?: string | null
          santri_id: string
          severity?: string
          status?: string
        }
        Update: {
          created_at?: string
          id?: string
          reason?: string
          reviewed_at?: string | null
          reviewed_by?: string | null
          rule_id?: string | null
          santri_id?: string
          severity?: string
          status?: string
        }
        Relationships: [
          {
            foreignKeyName: "early_warnings_rule_id_fkey"
            columns: ["rule_id"]
            isOneToOne: false
            referencedRelation: "early_warning_rules"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "early_warnings_santri_id_fkey"
            columns: ["santri_id"]
            isOneToOne: false
            referencedRelation: "santri"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "early_warnings_santri_id_fkey"
            columns: ["santri_id"]
            isOneToOne: false
            referencedRelation: "v_santri_overview"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "early_warnings_santri_id_fkey"
            columns: ["santri_id"]
            isOneToOne: false
            referencedRelation: "v_santri_scores"
            referencedColumns: ["santri_id"]
          },
        ]
      }
      growth_snapshots: {
        Row: {
          created_at: string
          id: string
          metrics: Json
          period_end: string
          period_start: string
          santri_id: string
          total_score: number
        }
        Insert: {
          created_at?: string
          id?: string
          metrics?: Json
          period_end: string
          period_start: string
          santri_id: string
          total_score?: number
        }
        Update: {
          created_at?: string
          id?: string
          metrics?: Json
          period_end?: string
          period_start?: string
          santri_id?: string
          total_score?: number
        }
        Relationships: [
          {
            foreignKeyName: "growth_snapshots_santri_id_fkey"
            columns: ["santri_id"]
            isOneToOne: false
            referencedRelation: "santri"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "growth_snapshots_santri_id_fkey"
            columns: ["santri_id"]
            isOneToOne: false
            referencedRelation: "v_santri_overview"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "growth_snapshots_santri_id_fkey"
            columns: ["santri_id"]
            isOneToOne: false
            referencedRelation: "v_santri_scores"
            referencedColumns: ["santri_id"]
          },
        ]
      }
      guidance: {
        Row: {
          approach: string | null
          coach: string | null
          created_at: string
          created_by: string | null
          goal: string
          id: string
          notes: string | null
          result: string | null
          santri_id: string
          source_incident_id: string | null
          start_date: string
          status: string
          target_date: string | null
          updated_at: string
        }
        Insert: {
          approach?: string | null
          coach?: string | null
          created_at?: string
          created_by?: string | null
          goal: string
          id?: string
          notes?: string | null
          result?: string | null
          santri_id: string
          source_incident_id?: string | null
          start_date?: string
          status?: string
          target_date?: string | null
          updated_at?: string
        }
        Update: {
          approach?: string | null
          coach?: string | null
          created_at?: string
          created_by?: string | null
          goal?: string
          id?: string
          notes?: string | null
          result?: string | null
          santri_id?: string
          source_incident_id?: string | null
          start_date?: string
          status?: string
          target_date?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "guidance_santri_id_fkey"
            columns: ["santri_id"]
            isOneToOne: false
            referencedRelation: "santri"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "guidance_santri_id_fkey"
            columns: ["santri_id"]
            isOneToOne: false
            referencedRelation: "v_santri_overview"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "guidance_santri_id_fkey"
            columns: ["santri_id"]
            isOneToOne: false
            referencedRelation: "v_santri_scores"
            referencedColumns: ["santri_id"]
          },
          {
            foreignKeyName: "guidance_source_incident_id_fkey"
            columns: ["source_incident_id"]
            isOneToOne: false
            referencedRelation: "incidents"
            referencedColumns: ["id"]
          },
        ]
      }
      guidance_followups: {
        Row: {
          coach: string | null
          created_at: string
          created_by: string | null
          guidance_id: string
          id: string
          next_action: string | null
          observation: string | null
          progress: number
          status: string
          tanggal: string
        }
        Insert: {
          coach?: string | null
          created_at?: string
          created_by?: string | null
          guidance_id: string
          id?: string
          next_action?: string | null
          observation?: string | null
          progress?: number
          status?: string
          tanggal?: string
        }
        Update: {
          coach?: string | null
          created_at?: string
          created_by?: string | null
          guidance_id?: string
          id?: string
          next_action?: string | null
          observation?: string | null
          progress?: number
          status?: string
          tanggal?: string
        }
        Relationships: [
          {
            foreignKeyName: "guidance_followups_guidance_id_fkey"
            columns: ["guidance_id"]
            isOneToOne: false
            referencedRelation: "guidance"
            referencedColumns: ["id"]
          },
        ]
      }
      incident_categories: {
        Row: {
          aktif: boolean
          dimension: string
          id: string
          nama: string
        }
        Insert: {
          aktif?: boolean
          dimension?: string
          id?: string
          nama: string
        }
        Update: {
          aktif?: boolean
          dimension?: string
          id?: string
          nama?: string
        }
        Relationships: []
      }
      incident_levels: {
        Row: {
          aktif: boolean
          id: string
          nama: string
          points: number
          urutan: number
        }
        Insert: {
          aktif?: boolean
          id?: string
          nama: string
          points?: number
          urutan?: number
        }
        Update: {
          aktif?: boolean
          id?: string
          nama?: string
          points?: number
          urutan?: number
        }
        Relationships: []
      }
      incidents: {
        Row: {
          category_id: string | null
          created_at: string
          created_by: string | null
          deskripsi: string
          id: string
          level_id: string | null
          lokasi: string | null
          points: number
          reporter: string | null
          santri_id: string
          status: string
          tanggal: string
          tindakan_awal: string | null
          updated_at: string
          waktu: string | null
        }
        Insert: {
          category_id?: string | null
          created_at?: string
          created_by?: string | null
          deskripsi: string
          id?: string
          level_id?: string | null
          lokasi?: string | null
          points?: number
          reporter?: string | null
          santri_id: string
          status?: string
          tanggal?: string
          tindakan_awal?: string | null
          updated_at?: string
          waktu?: string | null
        }
        Update: {
          category_id?: string | null
          created_at?: string
          created_by?: string | null
          deskripsi?: string
          id?: string
          level_id?: string | null
          lokasi?: string | null
          points?: number
          reporter?: string | null
          santri_id?: string
          status?: string
          tanggal?: string
          tindakan_awal?: string | null
          updated_at?: string
          waktu?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "incidents_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "incident_categories"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "incidents_level_id_fkey"
            columns: ["level_id"]
            isOneToOne: false
            referencedRelation: "incident_levels"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "incidents_santri_id_fkey"
            columns: ["santri_id"]
            isOneToOne: false
            referencedRelation: "santri"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "incidents_santri_id_fkey"
            columns: ["santri_id"]
            isOneToOne: false
            referencedRelation: "v_santri_overview"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "incidents_santri_id_fkey"
            columns: ["santri_id"]
            isOneToOne: false
            referencedRelation: "v_santri_scores"
            referencedColumns: ["santri_id"]
          },
        ]
      }
      kamar: {
        Row: {
          aktif: boolean
          asrama_id: string | null
          created_at: string
          id: string
          nama: string
        }
        Insert: {
          aktif?: boolean
          asrama_id?: string | null
          created_at?: string
          id?: string
          nama: string
        }
        Update: {
          aktif?: boolean
          asrama_id?: string | null
          created_at?: string
          id?: string
          nama?: string
        }
        Relationships: [
          {
            foreignKeyName: "kamar_asrama_id_fkey"
            columns: ["asrama_id"]
            isOneToOne: false
            referencedRelation: "asrama"
            referencedColumns: ["id"]
          },
        ]
      }
      kelas: {
        Row: {
          aktif: boolean
          created_at: string
          id: string
          nama: string
          tingkat: string | null
        }
        Insert: {
          aktif?: boolean
          created_at?: string
          id?: string
          nama: string
          tingkat?: string | null
        }
        Update: {
          aktif?: boolean
          created_at?: string
          id?: string
          nama?: string
          tingkat?: string | null
        }
        Relationships: []
      }
      notifications: {
        Row: {
          created_at: string
          entity_id: string | null
          entity_type: string | null
          id: string
          message: string | null
          read_at: string | null
          title: string
          type: string
          user_id: string
        }
        Insert: {
          created_at?: string
          entity_id?: string | null
          entity_type?: string | null
          id?: string
          message?: string | null
          read_at?: string | null
          title: string
          type?: string
          user_id: string
        }
        Update: {
          created_at?: string
          entity_id?: string | null
          entity_type?: string | null
          id?: string
          message?: string | null
          read_at?: string | null
          title?: string
          type?: string
          user_id?: string
        }
        Relationships: []
      }
      point_ledger: {
        Row: {
          created_at: string
          created_by: string | null
          description: string | null
          dimension: string
          id: string
          occurred_at: string
          points: number
          santri_id: string
          source_id: string | null
          source_type: string
        }
        Insert: {
          created_at?: string
          created_by?: string | null
          description?: string | null
          dimension?: string
          id?: string
          occurred_at?: string
          points?: number
          santri_id: string
          source_id?: string | null
          source_type: string
        }
        Update: {
          created_at?: string
          created_by?: string | null
          description?: string | null
          dimension?: string
          id?: string
          occurred_at?: string
          points?: number
          santri_id?: string
          source_id?: string | null
          source_type?: string
        }
        Relationships: [
          {
            foreignKeyName: "point_ledger_santri_id_fkey"
            columns: ["santri_id"]
            isOneToOne: false
            referencedRelation: "santri"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "point_ledger_santri_id_fkey"
            columns: ["santri_id"]
            isOneToOne: false
            referencedRelation: "v_santri_overview"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "point_ledger_santri_id_fkey"
            columns: ["santri_id"]
            isOneToOne: false
            referencedRelation: "v_santri_scores"
            referencedColumns: ["santri_id"]
          },
        ]
      }
      point_rules: {
        Row: {
          aktif: boolean
          deskripsi: string
          dimension: string
          id: string
          kode: string
          points: number
        }
        Insert: {
          aktif?: boolean
          deskripsi: string
          dimension?: string
          id?: string
          kode: string
          points?: number
        }
        Update: {
          aktif?: boolean
          deskripsi?: string
          dimension?: string
          id?: string
          kode?: string
          points?: number
        }
        Relationships: []
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string
          email: string | null
          full_name: string
          id: string
          updated_at: string
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string
          email?: string | null
          full_name?: string
          id: string
          updated_at?: string
        }
        Update: {
          avatar_url?: string | null
          created_at?: string
          email?: string | null
          full_name?: string
          id?: string
          updated_at?: string
        }
        Relationships: []
      }
      recognition_badges: {
        Row: {
          aktif: boolean
          deskripsi: string | null
          dimension: string
          icon: string
          id: string
          kode: string
          nama: string
          points: number
        }
        Insert: {
          aktif?: boolean
          deskripsi?: string | null
          dimension?: string
          icon?: string
          id?: string
          kode: string
          nama: string
          points?: number
        }
        Update: {
          aktif?: boolean
          deskripsi?: string | null
          dimension?: string
          icon?: string
          id?: string
          kode?: string
          nama?: string
          points?: number
        }
        Relationships: []
      }
      santri: {
        Row: {
          archived_at: string | null
          asrama_id: string | null
          created_at: string
          foto_url: string | null
          id: string
          jenis_kelamin: string
          kamar_id: string | null
          kelas_id: string | null
          nama: string
          nis: string
          panggilan: string | null
          qr_token: string
          status: string
          tahun_ajaran_id: string | null
          tahun_masuk: number | null
          updated_at: string
        }
        Insert: {
          archived_at?: string | null
          asrama_id?: string | null
          created_at?: string
          foto_url?: string | null
          id?: string
          jenis_kelamin?: string
          kamar_id?: string | null
          kelas_id?: string | null
          nama: string
          nis: string
          panggilan?: string | null
          qr_token?: string
          status?: string
          tahun_ajaran_id?: string | null
          tahun_masuk?: number | null
          updated_at?: string
        }
        Update: {
          archived_at?: string | null
          asrama_id?: string | null
          created_at?: string
          foto_url?: string | null
          id?: string
          jenis_kelamin?: string
          kamar_id?: string | null
          kelas_id?: string | null
          nama?: string
          nis?: string
          panggilan?: string | null
          qr_token?: string
          status?: string
          tahun_ajaran_id?: string | null
          tahun_masuk?: number | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "santri_asrama_id_fkey"
            columns: ["asrama_id"]
            isOneToOne: false
            referencedRelation: "asrama"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "santri_kamar_id_fkey"
            columns: ["kamar_id"]
            isOneToOne: false
            referencedRelation: "kamar"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "santri_kelas_id_fkey"
            columns: ["kelas_id"]
            isOneToOne: false
            referencedRelation: "kelas"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "santri_tahun_ajaran_id_fkey"
            columns: ["tahun_ajaran_id"]
            isOneToOne: false
            referencedRelation: "tahun_ajaran"
            referencedColumns: ["id"]
          },
        ]
      }
      settings: {
        Row: {
          key: string
          updated_at: string
          value: Json
        }
        Insert: {
          key: string
          updated_at?: string
          value?: Json
        }
        Update: {
          key?: string
          updated_at?: string
          value?: Json
        }
        Relationships: []
      }
      student_recognitions: {
        Row: {
          alasan: string | null
          badge_id: string
          created_at: string
          created_by: string | null
          id: string
          points: number
          santri_id: string
          tanggal: string
        }
        Insert: {
          alasan?: string | null
          badge_id: string
          created_at?: string
          created_by?: string | null
          id?: string
          points?: number
          santri_id: string
          tanggal?: string
        }
        Update: {
          alasan?: string | null
          badge_id?: string
          created_at?: string
          created_by?: string | null
          id?: string
          points?: number
          santri_id?: string
          tanggal?: string
        }
        Relationships: [
          {
            foreignKeyName: "student_recognitions_badge_id_fkey"
            columns: ["badge_id"]
            isOneToOne: false
            referencedRelation: "recognition_badges"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "student_recognitions_santri_id_fkey"
            columns: ["santri_id"]
            isOneToOne: false
            referencedRelation: "santri"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "student_recognitions_santri_id_fkey"
            columns: ["santri_id"]
            isOneToOne: false
            referencedRelation: "v_santri_overview"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "student_recognitions_santri_id_fkey"
            columns: ["santri_id"]
            isOneToOne: false
            referencedRelation: "v_santri_scores"
            referencedColumns: ["santri_id"]
          },
        ]
      }
      tahun_ajaran: {
        Row: {
          created_at: string
          id: string
          is_active: boolean
          nama: string
        }
        Insert: {
          created_at?: string
          id?: string
          is_active?: boolean
          nama: string
        }
        Update: {
          created_at?: string
          id?: string
          is_active?: boolean
          nama?: string
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          created_at: string
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      v_santri_overview: {
        Row: {
          achievement_score: number | null
          active_guidance: number | null
          archived_at: string | null
          asrama_id: string | null
          asrama_nama: string | null
          character_score: number | null
          contribution_score: number | null
          created_at: string | null
          discipline_score: number | null
          foto_url: string | null
          growth_score: number | null
          growth_score_metric: number | null
          id: string | null
          jenis_kelamin: string | null
          kamar_id: string | null
          kamar_nama: string | null
          kelas_id: string | null
          kelas_nama: string | null
          leadership_score: number | null
          nama: string | null
          nis: string | null
          panggilan: string | null
          points_current: number | null
          points_delta: number | null
          points_previous: number | null
          qr_token: string | null
          status: string | null
          tahun_ajaran_id: string | null
          tahun_masuk: number | null
          total_achievements: number | null
          total_incidents: number | null
          updated_at: string | null
        }
        Relationships: [
          {
            foreignKeyName: "santri_asrama_id_fkey"
            columns: ["asrama_id"]
            isOneToOne: false
            referencedRelation: "asrama"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "santri_kamar_id_fkey"
            columns: ["kamar_id"]
            isOneToOne: false
            referencedRelation: "kamar"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "santri_kelas_id_fkey"
            columns: ["kelas_id"]
            isOneToOne: false
            referencedRelation: "kelas"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "santri_tahun_ajaran_id_fkey"
            columns: ["tahun_ajaran_id"]
            isOneToOne: false
            referencedRelation: "tahun_ajaran"
            referencedColumns: ["id"]
          },
        ]
      }
      v_santri_scores: {
        Row: {
          achievement_score: number | null
          character_score: number | null
          contribution_score: number | null
          discipline_score: number | null
          growth_score: number | null
          growth_score_metric: number | null
          leadership_score: number | null
          points_current: number | null
          points_delta: number | null
          points_previous: number | null
          santri_id: string | null
        }
        Relationships: []
      }
    }
    Functions: {
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      is_admin: { Args: never; Returns: boolean }
      is_staff: { Args: never; Returns: boolean }
    }
    Enums: {
      app_role: "admin" | "pengasuhan"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      app_role: ["admin", "pengasuhan"],
    },
  },
} as const
