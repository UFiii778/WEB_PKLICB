// Penulis .xlsx minimal tanpa dependensi (ZIP "store" + SpreadsheetML).
// Cukup untuk 1 sheet berisi teks dengan header berwarna, freeze row, dan autofilter.

const enc = new TextEncoder();

const CRC_TABLE = (() => {
    const t = new Uint32Array(256);
    for (let n = 0; n < 256; n++) {
        let c = n;
        for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
        t[n] = c >>> 0;
    }
    return t;
})();

const crc32 = (bytes) => {
    let c = 0xffffffff;
    for (let i = 0; i < bytes.length; i++) c = CRC_TABLE[(c ^ bytes[i]) & 0xff] ^ (c >>> 8);
    return (c ^ 0xffffffff) >>> 0;
};

const esc = (s) =>
    String(s ?? '')
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        // karakter kontrol yang ilegal di XML 1.0
        .replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F]/g, '');

const colName = (i) => {
    let s = '';
    for (let n = i + 1; n > 0; n = Math.floor((n - 1) / 26)) s = String.fromCharCode(65 + ((n - 1) % 26)) + s;
    return s;
};

function zip(files) {
    const chunks = [];
    const central = [];
    let offset = 0;
    const u16 = (n) => [n & 0xff, (n >>> 8) & 0xff];
    const u32 = (n) => [n & 0xff, (n >>> 8) & 0xff, (n >>> 16) & 0xff, (n >>> 24) & 0xff];

    // 2026-01-01 00:00:00 dalam format DOS
    const dosTime = 0;
    const dosDate = ((2026 - 1980) << 9) | (1 << 5) | 1;

    for (const f of files) {
        const name = enc.encode(f.name);
        const data = enc.encode(f.content);
        const crc = crc32(data);
        const local = new Uint8Array([
            ...u32(0x04034b50), ...u16(20), ...u16(0x0800), ...u16(0),
            ...u16(dosTime), ...u16(dosDate), ...u32(crc), ...u32(data.length), ...u32(data.length),
            ...u16(name.length), ...u16(0),
        ]);
        chunks.push(local, name, data);
        central.push({ name, crc, size: data.length, offset });
        offset += local.length + name.length + data.length;
    }

    const cdStart = offset;
    for (const c of central) {
        const hdr = new Uint8Array([
            ...u32(0x02014b50), ...u16(20), ...u16(20), ...u16(0x0800), ...u16(0),
            ...u16(dosTime), ...u16(dosDate), ...u32(c.crc), ...u32(c.size), ...u32(c.size),
            ...u16(c.name.length), ...u16(0), ...u16(0), ...u16(0), ...u16(0), ...u32(0), ...u32(c.offset),
        ]);
        chunks.push(hdr, c.name);
        offset += hdr.length + c.name.length;
    }
    const cdSize = offset - cdStart;
    chunks.push(
        new Uint8Array([
            ...u32(0x06054b50), ...u16(0), ...u16(0), ...u16(central.length), ...u16(central.length),
            ...u32(cdSize), ...u32(cdStart), ...u16(0),
        ]),
    );
    return new Blob(chunks, { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
}

/**
 * @param {object} o
 * @param {string} o.sheetName
 * @param {string[]} o.headers
 * @param {Array<Array<string|number|{v:string, italic?:boolean}>>} o.rows
 * @param {number[]} [o.widths] lebar kolom (karakter)
 */
export function buildXlsx({ sheetName = 'Sheet1', headers, rows, widths = [] }) {
    const lastCol = colName(headers.length - 1);
    const lastRow = rows.length + 1;

    const cell = (v, ref, style) => {
        if (typeof v === 'number') return `<c r="${ref}"${style ? ` s="${style}"` : ''}><v>${v}</v></c>`;
        return `<c r="${ref}"${style ? ` s="${style}"` : ''} t="inlineStr"><is><t xml:space="preserve">${esc(v)}</t></is></c>`;
    };

    const headRow = `<row r="1" ht="22" customHeight="1">${headers.map((h, i) => cell(h, `${colName(i)}1`, 1)).join('')}</row>`;
    const bodyRows = rows
        .map((r, ri) => {
            const cells = r
                .map((raw, ci) => {
                    const obj = raw && typeof raw === 'object';
                    return cell(obj ? raw.v : raw, `${colName(ci)}${ri + 2}`, obj && raw.italic ? 2 : 0);
                })
                .join('');
            return `<row r="${ri + 2}">${cells}</row>`;
        })
        .join('');

    const cols = headers
        .map((_, i) => `<col min="${i + 1}" max="${i + 1}" width="${widths[i] ?? 16}" customWidth="1"/>`)
        .join('');

    const sheet = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<worksheet xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main"><sheetViews><sheetView workbookViewId="0"><pane ySplit="1" topLeftCell="A2" activePane="bottomLeft" state="frozen"/></sheetView></sheetViews><sheetFormatPr defaultRowHeight="16"/><cols>${cols}</cols><sheetData>${headRow}${bodyRows}</sheetData><autoFilter ref="A1:${lastCol}${lastRow}"/></worksheet>`;

    const styles = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<styleSheet xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main"><fonts count="3"><font><sz val="11"/><name val="Calibri"/></font><font><b/><sz val="11"/><color rgb="FFFFFFFF"/><name val="Calibri"/></font><font><i/><sz val="11"/><color rgb="FF94A3B8"/><name val="Calibri"/></font></fonts><fills count="3"><fill><patternFill patternType="none"/></fill><fill><patternFill patternType="gray125"/></fill><fill><patternFill patternType="solid"><fgColor rgb="FF03503B"/><bgColor indexed="64"/></patternFill></fill></fills><borders count="1"><border><left/><right/><top/><bottom/><diagonal/></border></borders><cellStyleXfs count="1"><xf numFmtId="0" fontId="0" fillId="0" borderId="0"/></cellStyleXfs><cellXfs count="3"><xf numFmtId="0" fontId="0" fillId="0" borderId="0" xfId="0"/><xf numFmtId="0" fontId="1" fillId="2" borderId="0" xfId="0" applyFont="1" applyFill="1" applyAlignment="1"><alignment horizontal="center" vertical="center"/></xf><xf numFmtId="0" fontId="2" fillId="0" borderId="0" xfId="0" applyFont="1"/></cellXfs><cellStyles count="1"><cellStyle name="Normal" xfId="0" builtinId="0"/></cellStyles></styleSheet>`;

    const safeName = esc(sheetName.replace(/[\\/?*[\]:]/g, ' ').slice(0, 31));

    return zip([
        {
            name: '[Content_Types].xml',
            content: `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types"><Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/><Default Extension="xml" ContentType="application/xml"/><Override PartName="/xl/workbook.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet.main+xml"/><Override PartName="/xl/worksheets/sheet1.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.worksheet+xml"/><Override PartName="/xl/styles.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.styles+xml"/></Types>`,
        },
        {
            name: '_rels/.rels',
            content: `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"><Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="xl/workbook.xml"/></Relationships>`,
        },
        {
            name: 'xl/workbook.xml',
            content: `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<workbook xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships"><sheets><sheet name="${safeName}" sheetId="1" r:id="rId1"/></sheets></workbook>`,
        },
        {
            name: 'xl/_rels/workbook.xml.rels',
            content: `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"><Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/worksheet" Target="worksheets/sheet1.xml"/><Relationship Id="rId2" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/styles" Target="styles.xml"/></Relationships>`,
        },
        { name: 'xl/styles.xml', content: styles },
        { name: 'xl/worksheets/sheet1.xml', content: sheet },
    ]);
}

export function buildCsv({ headers, rows }) {
    const q = (v) => `"${String(v && typeof v === 'object' ? v.v : v ?? '').replace(/"/g, '""')}"`;
    const body = [headers, ...rows].map((r) => r.map(q).join(',')).join('\r\n');
    // BOM supaya Excel membaca UTF-8 dengan benar
    return new Blob(['\ufeff' + body], { type: 'text/csv;charset=utf-8' });
}

export function download(blob, filename) {
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    a.remove();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
}
