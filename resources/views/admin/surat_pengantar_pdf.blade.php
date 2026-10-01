<!DOCTYPE html>
<html lang="id">
<head>
    <meta charset="UTF-8">
    <title>Surat Pengantar PKL - {{ $pengajuan->kode_pengajuan }}</title>
    <style>
        body { font-family: 'Times New Roman', Times, serif; font-size: 12pt; line-height: 1.5; margin: 30px; }
        .kop { border-bottom: 3px double #000; padding-bottom: 10px; margin-bottom: 20px; text-align: center; }
        .kop h2 { margin: 0; font-size: 16pt; font-weight: bold; text-transform: uppercase; }
        .kop h3 { margin: 0; font-size: 14pt; font-weight: bold; }
        .kop p { margin: 0; font-size: 10pt; italic; }
        .nomor-surat { text-align: center; margin-bottom: 20px; }
        .nomor-surat h4 { margin: 0; text-decoration: underline; text-transform: uppercase; }
        .table-siswa { width: 100%; border-collapse: collapse; margin: 15px 0; }
        .table-siswa th, .table-siswa td { border: 1px solid #000; padding: 6px 10px; text-align: left; font-size: 11pt; }
        .table-siswa th { background-color: #f2f2f2; text-align: center; }
        .ttd { width: 100%; margin-top: 40px; }
        .ttd td { text-align: center; vertical-align: top; }
        .stempel { border: 2px dashed #3b82f6; color: #1d4ed8; font-weight: bold; padding: 10px; border-radius: 8px; display: inline-block; font-size: 9pt; }
    </style>
</head>
<body>

    <!-- KOP Surat SMK ICB Cinta Niaga -->
    <div class="kop">
        <h2>YAYASAN CINTA NIAGA</h2>
        <h3>SMK ICB CINTA NIAGA BANDUNG</h3>
        <p>Jl. Pahlawan No. 19B Bandung | Telp: (022) 7208202 | Website: smkicbcn.sch.id</p>
    </div>

    <!-- Nomor Surat -->
    <div class="nomor-surat">
        <h4>SURAT PENGANTAR PRAKTIK KERJA LAPANGAN (PKL)</h4>
        <p>Nomor: 421.5 / {{ rand(100, 999) }} / HUBIN / {{ date('Y') }}</p>
    </div>

    <p>Kepada Yth.<br>
    <strong>Pimpinan / HRD {{ $pengajuan->perusahaan->nama_perusahaan }}</strong><br>
    {{ $pengajuan->perusahaan->alamat_lengkap }}</p>

    <p>Dengan hormat,</p>
    <p>Dalam rangka pelaksanaan program Praktik Kerja Lapangan (PKL) siswa SMK ICB Cinta Niaga Bandung, bersama ini kami mengajukan permohonan untuk menempatkan siswa/i kami pada perusahaan yang Bapak/Ibu pimpin. Adapun daftar nama siswa tersebut adalah sebagai berikut:</p>

    <!-- Tabel Daftar Nama & NIS Siswa -->
    <table class="table-siswa">
        <thead>
            <tr>
                <th width="5%">No</th>
                <th>Nama Siswa</th>
                <th>NIS</th>
                <th>Kelas / Jurusan</th>
            </tr>
        </thead>
        <tbody>
            <tr>
                <td style="text-align: center;">1</td>
                <td>{{ $pengajuan->ketua->name }} (Ketua)</td>
                <td>{{ $pengajuan->ketua->nis_nip }}</td>
                <td>{{ $pengajuan->ketua->kelas }}</td>
            </tr>
            @foreach($pengajuan->anggota as $index => $a)
            <tr>
                <td style="text-align: center;">{{ $index + 2 }}</td>
                <td>{{ $a->siswa->name }}</td>
                <td>{{ $a->siswa->nis_nip }}</td>
                <td>{{ $a->siswa->kelas }}</td>
            </tr>
            @endforeach
        </tbody>
    </table>

    <p>Pelaksanaan PKL direncanakan berlangsung mulai tanggal <strong>{{ \Carbon\Carbon::parse($pengajuan->tgl_mulai_pkl)->format('d F Y') }}</strong> sampai dengan <strong>{{ \Carbon\Carbon::parse($pengajuan->tgl_selesai_pkl)->format('d F Y') }}</strong>.</p>

    <p>Demikian surat pengantar ini kami sampaikan, atas perhatian dan kerja samanya kami ucapkan terima kasih.</p>

    <!-- Bagian TTD & Stempel Digital -->
    <table class="ttd">
        <tr>
            <td width="50%"></td>
            <td width="50%">
                Bandung, {{ date('d F Y') }}<br>
                Kepala Hubungan Industri (HUBIN)<br><br><br>
                <div class="stempel">
                    VERIFIED DIGITAL STAMP<br>
                    SMK ICB CINTA NIAGA<br>
                    KODE: {{ $pengajuan->kode_pengajuan }}
                </div>
                <br><br>
                <strong><u>Dra. Hj. Nining S.M.</u></strong><br>
                NIP. 196803211994032001
            </td>
        </tr>
    </table>

</body>
</html>