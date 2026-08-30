# Santri Growth Hub

MASTER PROMPT — BUILD SANTRIOS FULL-STACK

Bangun aplikasi web production-ready bernama SantriOS — Student Growth, Achievement, Discipline & Guidance Intelligence Platform berdasarkan seluruh PRD SantriOS yang diberikan sebelumnya. Jangan membuat prototype kosong, jangan hanya membuat frontend mockup, dan jangan menggunakan dummy CRUD sebagai pengganti backend. Bangun aplikasi full-stack nyata dengan database, authentication, authorization, storage, serverless backend, validation, audit trail, responsive UI, dan seluruh core workflow yang terhubung secara nyata.

Gunakan PRD yang sudah diberikan sebelumnya sebagai source of truth utama untuk product requirement. Jangan menghilangkan fitur yang telah ditentukan. Jadikan spesifikasi di bawah ini sebagai instruksi implementasi teknis, arsitektur, UX, security, dan kualitas produk.

1. TUJUAN IMPLEMENTASI

Aplikasi ini adalah sistem internal pesantren untuk mengelola perkembangan santri secara menyeluruh.

Produk harus menggabungkan:

data santri

achievement/prestasi

incident/pelanggaran

point ledger

Growth Score

Student 360

Santri Journey

Guidance/pembinaan

Recognition

Leaderboard

Early Warning

AI Insight

Reports

Notifications

Digital Santri ID / QR

Audit Log

Search dan Filter

Admin configuration

Jangan membuat aplikasi terasa seperti template admin biasa.

Produk harus terasa seperti modern SaaS product, premium, tenang, bersih, profesional, mobile-first, dan manusiawi.

2. ARSITEKTUR WAJIB

Gunakan arsitektur serverless-first.

Prioritas stack:

React / Next.js sesuai kemampuan environment Lovable

TypeScript

Tailwind CSS

Supabase

Supabase PostgreSQL

Supabase Auth

Supabase Storage

Supabase Row Level Security

Server-side functions / edge functions bila diperlukan

Vercel-compatible deployment architecture

Jangan membuat backend tradisional dengan server VPS.

Semua data transaksional harus benar-benar masuk ke PostgreSQL melalui backend yang aman.

Gunakan Supabase sebagai backend utama.

Gunakan Supabase Auth sebagai authentication provider.

Gunakan Supabase Storage untuk file bukti seperti foto, sertifikat, atau dokumen.

Gunakan Row Level Security secara serius.

Authorization tidak boleh hanya dilakukan melalui hiding menu frontend.

Semua operasi sensitif harus divalidasi kembali di server/database.

3. AUTHENTICATION

Halaman publik aplikasi hanya satu:

Login

Tidak perlu landing page marketing.

Login menjadi pintu utama ke aplikasi.

Setelah login, sistem harus membaca role user dan mengarahkan user ke workspace yang sesuai.

Role hanya dua:

Admin

Pengasuhan

Tidak perlu role publik lain pada versi ini.

Authentication harus menggunakan Supabase Auth.

Gunakan email/password sebagai metode utama.

Jangan menyimpan password manual di tabel aplikasi.

Jangan membuat password hardcoded yang terbaca di source frontend.

4. DEV LOGIN / DEMO LOGIN

Buat area khusus pada halaman Login bernama:

Dev Login

Tujuannya untuk development/testing/demo.

Harus tersedia dua tombol:

Admin

Pengasuhan

Saat user mengklik tombol:

Dev Login → Admin

form email dan password otomatis terisi dengan credential akun development yang disediakan oleh environment.

Kemudian user dapat langsung masuk.

Buat juga:

Dev Login → Pengasuhan

yang otomatis mengisi credential akun development Pengasuhan.

Credential jangan expose secara hardcoded dalam production frontend.

Gunakan environment variables / konfigurasi development yang aman.

Contoh konsep:

DEMO_ADMIN_EMAIL

DEMO_ADMIN_PASSWORD

DEMO_PENGASUHAN_EMAIL

DEMO_PENGASUHAN_PASSWORD

Jika account development belum ada di Supabase Auth, sediakan mekanisme seed/setup yang jelas untuk membuat akun tersebut.

Dev Login tidak boleh menjadi bypass authentication.

Tetap lakukan login melalui Supabase Auth.

5. USER FLOW LOGIN

Flow:

Login page

↓

Email + Password

↓

Supabase Auth

↓

Session valid

↓

Ambil profile user

↓

Ambil role

↓

Role check

↓

Redirect

Admin → Admin Workspace

Pengasuhan → Pengasuhan Workspace

Jika tidak authenticated:

→ kembali ke Login

Jika session expired:

→ redirect Login

Jika role tidak valid:

→ tampilkan authorization error yang aman.

6. DATABASE

Gunakan PostgreSQL Supabase.

Buat schema production-ready.

Gunakan UUID untuk primary key entity penting.

Gunakan foreign key.

Gunakan created_at dan updated_at.

Gunakan soft delete/archive jika lebih aman daripada hard delete.

Jangan menyimpan aggregate score sebagai data manual yang mudah tidak sinkron.

Gunakan source events dan point ledger sebagai sumber perhitungan.

Core tables minimal:

users/profile

roles

user_roles

santri

kelas

kamar

asrama

tahun_ajaran

achievement_categories

achievement_levels

achievements

incident_categories

incident_levels

incidents

guidance

guidance_followups

recognition_badges

student_recognitions

point_rules

point_ledger

growth_snapshots

early_warning_rules

early_warnings

attachments

notifications

activity_logs

settings

Tambahkan tabel pendukung bila arsitektur membutuhkannya.

Jangan mengorbankan normalization hanya untuk membuat schema terlihat sederhana.

7. DATA SANTRI

Buat modul Santri dengan CRUD lengkap.

Minimal field:

id

NIS

nama lengkap

nama panggilan

foto

kelas

kamar

asrama

tahun masuk

tahun ajaran

status

created_at

updated_at

Tambahkan field lain hanya jika benar-benar dibutuhkan PRD.

List Santri harus support:

search

filter kelas

filter kamar

filter asrama

filter status

filter tahun ajaran

sorting

pagination

Gunakan server-side query.

Jangan load ribuan santri sekaligus.

8. STUDENT 360

Student 360 harus menjadi salah satu halaman terbaik dalam aplikasi.

Header:

foto

nama santri

NIS

kelas

kamar

asrama

status

Growth Score

trend

Di bawahnya tampilkan:

Achievement

Discipline

Character

Contribution

Leadership

Growth

Gunakan visual metric yang modern.

Buat:

Growth Overview

↓

Santri Journey

↓

Strengths

↓

Attention Areas

↓

Active Guidance

↓

Recent Achievement

↓

Recognition

↓

Point History

Seluruh data harus berasal dari database nyata.

9. SANTRI JOURNEY

Buat timeline visual.

Event dapat berupa:

Achievement

Incident

Guidance

Follow-up

Recognition

Milestone

Score Change

Setiap event harus memiliki:

tanggal

judul

jenis

metadata

source record

link detail

Timeline harus dapat difilter.

Filter:

All

Achievement

Incident

Guidance

Recognition

10. ACHIEVEMENT

Buat modul prestasi yang production-ready.

Field:

santri

category

level

event name

organizer

date

result/rank

points

description

coach

attachments

created_by

created_at

Validation harus dilakukan sebelum insert.

Point dihitung dari point rule.

Jangan memberikan point secara hardcoded di frontend.

Achievement otomatis masuk ke:

Student 360

Journey

Achievement Wall

Point Ledger

Growth calculation

Recognition system bila memenuhi rule.

11. INCIDENT / PELANGGARAN

Buat modul Incident.

Gunakan pendekatan human-centered.

Record:

santri

category

level

date

time

location

description

reporter

points

initial action

status

attachments

created_at

Incident tidak sama dengan hukuman.

Pisahkan:

Incident

dan

Guidance

Satu incident dapat memiliki beberapa proses pembinaan/follow-up.

12. GUIDANCE / PEMBINAAN

Buat modul Guidance.

Field:

santri

source_incident

goal

approach

coach

start_date

target_date

status

result

notes

created_at

updated_at

Status:

Planned

Active

Follow-up

Completed

Closed

Buat halaman:

Active Guidance

Follow-up

History

Tampilkan guidance yang sudah melewati deadline.

Berikan attention indicator.

13. FOLLOW-UP

Buat tabel follow-up.

Field:

guidance_id

date

coach

observation

progress

next_action

status

created_at

Pengasuhan dapat menambahkan follow-up dari Student 360.

Progress harus bisa direpresentasikan secara visual.

14. POINT LEDGER

Jangan hanya menyimpan total point.

Buat ledger event-based.

Contoh:

Achievement:

+50

Incident:

-10

Recognition:

+15

Setiap ledger harus memiliki:

student_id

source_type

source_id

points

description

created_by

created_at

Total point dihitung dari ledger.

Berikan indexing yang tepat.

Pastikan update/delete record sumber tidak menghasilkan ledger yang salah.

Koreksi point harus diaudit.

15. GROWTH SCORE

Buat centralized scoring service.

Jangan hitung formula berbeda di setiap halaman.

Metric minimal:

Achievement

Discipline

Character

Contribution

Leadership

Growth

Buat konfigurasi bobot.

Buat function/service untuk menghasilkan score.

Semua UI:

dashboard

Student 360

leaderboard

reports

AI insight

harus menggunakan sumber perhitungan yang konsisten.

Simpan snapshot periodik agar historical reporting stabil.

16. EARLY WARNING SYSTEM

Buat rule engine berbasis data.

Contoh rule:

incident meningkat

incident berulang

discipline score turun

guidance overdue

perubahan score drastis

Early warning memiliki:

student

rule

severity

reason

status

created_at

reviewed_at

reviewed_by

Status:

Stable

Needs Attention

At Risk

Critical

Jangan hanya menampilkan angka risk.

Tampilkan alasan:

"4 incident dalam 14 hari."

"Discipline turun 9 poin."

"Follow-up terlambat 3 hari."

Semua rule harus dapat dikonfigurasi admin.

17. DASHBOARD

Dashboard bukan kumpulan card kecil.

Buat dashboard modern dengan hierarchy kuat.

Section:

Greeting

Growth Overview

Key Metrics

Needs Attention

Recent Achievements

Guidance Follow-up

Recognition

Trends

Gunakan visualisasi yang benar-benar membantu.

Contoh metric:

Total Santri

Achievement

Incident

Active Guidance

Most Improved

Needs Attention

Growth Score

Gunakan real data dari Supabase.

18. ACHIEVEMENT WALL

Buat feed visual.

Card achievement:

Foto

Nama

Achievement

Level

Tanggal

Badge

Point

Card harus terasa seperti recognition feed, bukan tabel.

Support filter:

periode

kategori

level

kelas

asrama

19. RECOGNITION

Buat badge system.

Default badges:

Achievement

Champion

Consistent Learner

Role Model

Most Improved

Helpful

Leadership

Admin dapat menambah/edit/nonaktifkan badge.

Pengasuhan dapat memberikan badge berdasarkan permission.

Recognition harus muncul di Student 360 dan Achievement Wall.

20. MOST IMPROVED

Jangan hanya membuat ranking berdasarkan total point.

Buat ranking:

Highest Growth

Achievement

Discipline

Contribution

Most Improved

Most Improved dihitung dari perubahan antarperiode.

Tampilkan:

Previous

Current

Change

Trend

21. LEADERBOARD

Buat leaderboard yang sehat dan tidak mempermalukan.

Modes:

Growth

Achievement

Most Improved

Contribution

Discipline

Support filter:

mingguan

bulanan

semester

tahun ajaran

Leaderboard bisa berdasarkan:

Santri

Kelas

Kamar

Asrama

Jika konfigurasi pesantren menggunakan struktur tersebut.

22. QR SANTRI ID

Setiap santri dapat memiliki QR.

QR hanya menyimpan opaque identifier/token.

Jangan masukkan informasi pribadi langsung ke QR.

Ketika QR dipindai oleh user authenticated:

Tampilkan:

Lihat Profil

Tambah Prestasi

Tambah Incident

Tambah Guidance

Authorization tetap harus diperiksa server-side.

23. QUICK RECORD

Mobile workflow harus memiliki tombol:

+ Record

Action:

Achievement

Incident

Guidance

Recognition

Quick Record harus sangat cepat.

Form dibuat bertahap.

Step pertama:

Pilih Santri

↓

Pilih jenis

↓

Input data inti

↓

Save

↓

Success

Detail tambahan dapat dilengkapi kemudian jika diperlukan.

24. SEARCH

Buat Global Search.

Search:

Nama Santri

NIS

Achievement

Incident

Guidance

Support keyboard shortcut desktop bila memungkinkan.

Mobile tetap menyediakan search yang mudah ditemukan.

Query harus server-side.

Tambahkan debounce.

25. REPORTS

Buat Reports.

Report:

Student

Achievement

Incident

Guidance

Points

Growth

Support:

date range

kelas

kamar

asrama

kategori

level

status

Export:

CSV

XLSX

PDF bila environment mendukung.

26. NOTIFICATIONS

Buat in-app notification.

Event:

achievement created

incident created

guidance due

guidance overdue

warning created

recognition received

notification memiliki:

title

message

type

read/unread

created_at

Klik notification → buka source record.

27. AUDIT LOG

Wajib ada.

Catat:

login

create

update

archive

delete

role change

point configuration change

master data change

important record change

Field:

actor

action

entity

entity_id

timestamp

metadata

Jangan mengizinkan user biasa menghapus audit log.

Admin hanya dapat melihatnya.

28. SETTINGS

Admin Settings:

Users

Roles

Santri Structure

Kelas

Kamar

Asrama

Tahun Ajaran

Achievement Categories

Achievement Levels

Incident Categories

Incident Levels

Guidance settings

Point Rules

Recognition Badges

Early Warning Rules

Application Settings

Audit Logs

Pengasuhan tidak boleh memiliki akses ke konfigurasi sistem sensitif.

29. ROLE SECURITY

ADMIN:

full access sesuai policy.

PENGASUHAN:

operasional data santri dan pembinaan.

Pastikan RLS membatasi akses.

Jangan hanya:

if role === admin

di frontend.

Harus ada server/database enforcement.

30. UI/UX

Gunakan standar UI/UX microcopy yang diberikan sebagai aturan wajib.

Placeholder:

maksimal 1 kata.

Contoh:

Nama

Email

Cari

Password

Pesan

Button:

maksimal 1–2 kata.

Contoh:

Simpan

Edit

Hapus

Buka

Cari

Tambah

Upload

Scan

Judul:

pendek.

Subtitle hanya bila perlu.

Jangan membuat paragraph panjang di interface.

Gunakan progressive disclosure.

Gunakan tooltip/popover/accordion untuk informasi sekunder.

Jangan mengulang informasi.

Gunakan terminology konsisten.

Jangan membuat UI penuh teks hanya untuk mengisi ruang kosong.

Semua aturan ini mengikuti skill UI/UX yang diberikan.

31. VISUAL DESIGN

Desain harus terasa:

Modern

Premium

Calm

Human-centered

Islamic-inspired secara halus

SaaS-quality

Bukan:

Bootstrap admin template

Dashboard jadul

UI penuh border

UI penuh gradient

UI terlalu ramai

UI penuh ornamen islami

Gunakan:

generous whitespace

rounded cards

soft surfaces

modern typography

subtle shadows

clear hierarchy

clean charts

beautiful avatars

badges

timeline

micro-interactions

32. RESPONSIVE MOBILE

Mobile adalah PRIORITAS UTAMA.

Bukan sekadar mengecilkan desktop.

Desain harus dibuat dari mobile terlebih dahulu.

Pada mobile:

bottom navigation:

Home

Santri

Record

Growth

More

Quick Record harus sangat mudah diakses.

Table harus berubah menjadi card/list.

Filter menggunakan bottom sheet/drawer.

Detail profile menjadi vertical flow.

Chart harus touch-friendly.

Button cukup besar.

Tidak boleh ada horizontal overflow.

Tidak boleh ada text clipping.

Tidak boleh ada card yang terlalu kecil untuk disentuh.

33. DESKTOP

Pada desktop gunakan sidebar.

Sidebar:

Overview

Santri

Growth

Achievements

Incidents

Guidance

Recognition

Leaderboard

Reports

AI Insights

Settings

Sidebar dapat collapse.

Content area memiliki max width yang nyaman.

Dashboard menggunakan grid yang proporsional.

Jangan membuat semua item menjadi card yang sama besar.

34. MOTION

Tambahkan motion dengan halus.

Page transition.

Card entrance.

Chart animation.

Modal transition.

Drawer transition.

Toast transition.

Timeline reveal.

Gunakan duration yang cepat dan natural.

Hormati prefers-reduced-motion.

Jangan menggunakan animasi berlebihan.

35. EMPTY STATES

Jangan menggunakan dummy paragraph.

Contoh:

"Belum ada data"

CTA:

"Tambah"

Achievement:

"Belum ada prestasi"

Incident:

"Belum ada incident"

Guidance:

"Belum ada pembinaan"

36. ERROR STATE

Gunakan microcopy pendek.

Contoh:

"Email tidak valid."

"Password salah."

"Gagal memuat."

"File terlalu besar."

"Format tidak didukung."

"Belum tersimpan."

Jangan tampilkan technical stack trace.

37. LOADING

Gunakan skeleton loading.

Loading copy:

Memuat...

Menyimpan...

Menghapus...

Mengunggah...

Memproses...

Jangan membuat paragraph loading panjang.

38. FORM UX

Semua form harus:

accessible

label jelas

validation inline

error state jelas

mobile-friendly

keyboard friendly

loading state

success feedback

Jangan menggunakan placeholder sebagai label.

Placeholder hanya 1 kata mengikuti UI skill.

39. FILE UPLOAD

Upload menggunakan Supabase Storage.

Validation:

mime type

file size

extension

authorization

Buat private bucket untuk file sensitif.

Gunakan signed URL.

Jangan membuat bucket publik untuk dokumen internal.

Preview image bila memungkinkan.

40. SECURITY

Wajib:

Supabase RLS

secure auth

server validation

input validation

rate limiting bila tersedia

secure storage

environment variables

no secrets in frontend source

no password in database application tables

no privileged service role key in browser

no sensitive data in QR

audit logging

least privilege

41. DATABASE INDEXING

Tambahkan index untuk:

santri.name

santri.nis

santri.status

achievement.santri_id

achievement.created_at

incident.santri_id

incident.created_at

guidance.santri_id

guidance.status

point_ledger.santri_id

notifications.user_id

notifications.read_at

activity_logs.actor_id

foreign keys

Gunakan full-text/trigram strategy bila relevan untuk search.

42. PERFORMANCE

Jangan fetch seluruh database.

Gunakan:

pagination

lazy loading

server-side filtering

select only required fields

indexed queries

aggregations

caching jika perlu

optimized image loading

Jangan melakukan query yang sama berkali-kali pada satu page.

43. DATA CONSISTENCY

Semua data agregat harus konsisten.

Jika Achievement dibuat:

record achievement

↓

point ledger

↓

growth calculation

↓

notification

↓

recognition evaluation

harus dilakukan dengan workflow transactional/atomic sejauh kemampuan Supabase architecture.

Jangan membuat frontend mengarang hasil agregasi.

44. AI INSIGHT

Buat AI Insight tetapi jangan jadikan AI sebagai source of truth.

AI hanya membaca data terstruktur.

AI boleh membantu:

summary

trend

positive development

attention area

guidance suggestion

AI tidak boleh:

memberikan diagnosis

memberikan label kepribadian

memutuskan hukuman

mengambil keputusan otomatis terhadap santri

Core database tetap menjadi sumber utama.

AI output diberi timestamp.

Tampilkan periode data yang dipakai.

Contoh:

"Insight · Agustus 2026"

45. MOBILE QUICK ACTION

Floating/central action:

+

Saat ditekan:

Achievement

Incident

Guidance

Recognition

Gunakan bottom sheet.

Setelah berhasil:

toast singkat:

"Tersimpan!"

46. ACCESSIBILITY

Wajib:

semantic HTML

accessible labels

keyboard navigation

visible focus state

contrast memadai

screen reader support

error state tidak hanya berdasarkan warna

status tidak hanya berdasarkan warna

reduced motion

touch target yang cukup besar

47. DEVELOPMENT QUALITY

Gunakan component architecture yang bersih.

Pisahkan:

components

pages/routes

hooks

services

database queries

types

validation schemas

utilities

auth

permissions

AI services

charts

Tidak menaruh seluruh logic dalam satu file besar.

Gunakan reusable components.

Centralize constants.

Centralize permission rules.

Centralize scoring.

Centralize point calculation.

48. TYPE SAFETY

Gunakan TypeScript.

Generate/use Supabase types bila memungkinkan.

Hindari any kecuali benar-benar diperlukan.

Type semua API response.

Type all forms.

Type all database entities.

Gunakan schema validation seperti Zod jika sesuai.

49. SERVERLESS FUNCTIONS

Gunakan edge/serverless functions untuk:

AI processing

specialized aggregation

secure privileged operations

signed URL generation

complex report generation

scheduled task bila tersedia

Jangan expose service-role key ke frontend.

50. SEED DATA

Buat seed data development yang realistis.

Minimal:

20–50 santri

beberapa kelas

beberapa kamar

beberapa achievement

beberapa incident

beberapa guidance

beberapa recognition

point rules

warning rules

notifications

Gunakan data fiktif.

Jangan menggunakan data orang nyata.

Buat seed yang membuat dashboard langsung terlihat hidup.

51. DEV ACCOUNTS

Sediakan development accounts:

Admin Demo

Pengasuhan Demo

Credential berasal dari environment variable/setup.

Dev Login menggunakan auth normal.

Jangan membuat magic session bypass.

Pastikan role profile benar di database.

52. DATA MASTER DEFAULT

Seed default:

Achievement Categories:

Akademik

Olahraga

Seni

Keagamaan

Organisasi

Kompetisi

Achievement Levels:

Internal

Kecamatan

Kabupaten

Provinsi

Nasional

Internasional

Incident Levels:

Ringan

Sedang

Berat

Recognition:

Champion

Achievement

Most Improved

Role Model

Helpful

Leadership

Consistent Learner

Semua dapat diubah Admin.

53. REPORT EXPORT

Export harus menggunakan data actual.

File export harus mengikuti filter yang sedang aktif.

Nama file otomatis.

Contoh:

laporan-prestasi-agustus-2026.xlsx

Jangan membuat file export berisi data yang tidak sesuai filter.

54. SEARCH UX

Search harus terasa instan.

Placeholder:

Cari

Hasil:

Santri

Achievement

Incident

Guidance

Jangan membuat user membuka banyak halaman untuk menemukan santri.

55. MOBILE PROFILE

Student 360 mobile:

Profile Header

Score

Metrics

Trend

Journey

Guidance

Achievement

Recognition

Point

Action

Gunakan sticky/floating action untuk:

Tambah

Jangan memenuhi layar dengan navbar besar.

56. ADMIN UX

Admin dashboard lebih analytical.

Tampilkan:

total santri

growth

trend

achievement

incident

guidance

warning

activity

Admin juga memiliki access ke konfigurasi.

57. PENGASUHAN UX

Pengasuhan dashboard lebih operational.

Prioritas:

Needs Attention

Quick Record

Active Guidance

Recent Incident

Recent Achievement

Follow-up

Search Santri

Jangan memenuhi halaman dengan admin configuration.

58. RESPONSIVE BREAKPOINT STRATEGY

Gunakan responsive behavior untuk:

mobile

tablet

desktop

wide desktop

Test minimal:

360px

390px

430px

768px

1024px

1280px

1440px

1920px

Tidak boleh ada layout rusak.

59. QUALITY BAR

Saya tidak ingin hasil yang hanya "kelihatan jadi".

Saya ingin hasil yang terasa seperti produk SaaS profesional yang benar-benar bisa digunakan.

Setiap halaman harus memiliki:

loading

empty

error

success

mobile

desktop

accessibility

authorization

real database

real mutation

60. IMPLEMENTATION ORDER

Kerjakan secara berurutan:

Project foundation

Supabase connection

Database schema

RLS policies

Auth

Roles

Dev Login

App shell

Dashboard

Santri

Student 360

Achievement

Incident

Guidance

Point Ledger

Recognition

Journey

Early Warning

Leaderboard

Reports

Notifications

QR

AI Insight

Audit Logs

Settings

Seed data

Responsive polish

Accessibility

Performance optimization

Final QA

61. IMPORTANT: DO NOT CHEAT

Jangan:

mengganti Supabase dengan localStorage

membuat fake authentication

membuat fake database

menyimpan data utama di browser

hardcode data dashboard

membuat tombol yang tidak berfungsi

membuat CRUD tanpa validation

membuat role hanya berdasarkan UI

expose secret key

membuat QR berisi data sensitif

menggunakan dummy dashboard setelah database tersedia

Semua core feature harus benar-benar connected.

62. IMPLEMENTATION EXPECTATION

Saat membangun:

buat database schema

buat migration

buat RLS

buat seed

buat auth

buat role logic

buat UI

buat server-side mutation

buat validation

buat loading

buat empty state

buat error state

buat notification

buat audit

buat responsive behavior

Semua harus saling terhubung.

63. FINAL DESIGN DIRECTION

Bayangkan SantriOS sebagai gabungan:

modern SaaS dashboard

student development platform

analytics workspace

recognition platform

guidance system

dengan identitas pesantren yang modern.

Jangan meniru dashboard administrasi konvensional.

Visual hierarchy harus:

Primary information

↓

Action

↓

Context

↓

Detail

Gunakan whitespace untuk memberikan rasa premium.

64. FINAL MICROCOPY RULE

Ikuti skill UI/UX yang diberikan sebagai mandatory constraint.

Rule:

Placeholder = maksimal 1 kata.

Button = maksimal 1–2 kata.

Title = pendek.

Subtitle = hanya jika diperlukan.

Toast = maksimal 2–3 kata.

Helper = satu kalimat pendek.

Error = langsung ke masalah.

Jangan menggunakan UX filler seperti:

"Silakan"

"Anda dapat"

"Harap"

"Pada bagian ini"

"Klik di sini"

Jangan menambahkan teks hanya untuk memenuhi ruang kosong.

65. FINAL RESULT

Pada akhirnya saya ingin Lovable menghasilkan aplikasi SantriOS yang:

real

functional

secure

serverless

Supabase-powered

role-based

responsive

mobile-first

modern

premium

accessible

scalable

production-ready

Bukan sekadar desain.

Bukan sekadar frontend.

Bukan prototype.

Buat seluruh sistem end-to-end.

Gunakan PRD SantriOS sebagai source of truth.

Pastikan Admin dan Pengasuhan memiliki pengalaman yang berbeda sesuai kebutuhan kerja masing-masing.

Pastikan Login adalah satu-satunya public entry.

Pastikan Dev Login tetap menggunakan Supabase Auth.

Pastikan database benar-benar Supabase PostgreSQL.

Pastikan semua data real-time/actual dari database.

Pastikan RLS aktif.

Pastikan storage aman.

Pastikan seluruh core workflow berfungsi.

Pastikan desktop bagus.

Tetapi prioritaskan mobile lebih tinggi.

Dan pastikan hasil akhirnya terlihat seperti produk SaaS modern yang benar-benar dibuat oleh product designer dan engineer berpengalaman, bukan template CRUD generik.

This project was built with [Lovable](https://lovable.dev).

## Build with Lovable

Continue developing this project in the [Lovable editor](https://lovable.dev/projects/28ef8f6a-bfbf-454b-b56c-3df7eea99a2a).

- **Ship faster**: describe what you want to build and Lovable handles the code.
- **Stay in sync**: every change made in Lovable is committed straight to this repository.
- **Full ownership**: this code is yours. Push to `main` on GitHub and your changes sync back into Lovable, ready for your next prompt.

## Development

Prefer working locally? You need Node.js and npm — [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating).

```sh
git clone <this-repository-url>
cd <repository-name>
npm i
npm run dev
```
