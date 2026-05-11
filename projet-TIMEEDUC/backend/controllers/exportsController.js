const db = require('../config/db');
const ExcelJS = require('exceljs');
const PDFDocument = require('pdfkit');

// ==================== EXPORT EXCEL ====================
exports.exporterExcel = async (req, res) => {
    try {
        const workbook = new ExcelJS.Workbook();
        const feuille = workbook.addWorksheet('Heures enseignants');

        feuille.columns = [
            { header: 'Nom', key: 'nom', width: 20 },
            { header: 'Prénom', key: 'prenom', width: 20 },
            { header: 'Grade', key: 'grade', width: 20 },
            { header: 'Département', key: 'departement', width: 20 },
            { header: 'Total heures', key: 'total_heures', width: 15 },
            { header: 'H. CM', key: 'total_cm', width: 10 },
            { header: 'H. TD', key: 'total_td', width: 10 },
            { header: 'H. TP', key: 'total_tp', width: 10 },
            { header: 'H. contractuelles', key: 'heures_contractuelles', width: 18 },
            { header: 'H. complémentaires', key: 'heures_complementaires', width: 20 },
            { header: 'Taux horaire', key: 'taux_horaire', width: 15 },
            { header: 'Montant total (FCFA)', key: 'montant_total', width: 20 }
        ];

        // Style en-tête
        feuille.getRow(1).eachCell(cell => {
            cell.fill = {
                type: 'pattern',
                pattern: 'solid',
                fgColor: { argb: 'FF1a2a4a' }
            };
            cell.font = { color: { argb: 'FFf0c027' }, bold: true };
            cell.alignment = { horizontal: 'center' };
        });

        const enseignants = await new Promise((resolve, reject) => {
            db.query(`
                SELECT e.id, u.nom, u.prenom, e.grade, e.statut, e.departement, 
                       e.taux_horaire, e.heures_contractuelles
                FROM enseignants e
                JOIN utilisateurs u ON e.utilisateur_id = u.id
            `, (err, results) => {
                if (err) reject(err);
                else resolve(results);
            });
        });

        for (const ens of enseignants) {
            const heures = await new Promise((resolve, reject) => {
                db.query(`
                    SELECT 
                        COALESCE(SUM(duree), 0) as total_heures,
                        COALESCE(SUM(CASE WHEN type_heure = 'CM' THEN duree ELSE 0 END), 0) as total_cm,
                        COALESCE(SUM(CASE WHEN type_heure = 'TD' THEN duree ELSE 0 END), 0) as total_td,
                        COALESCE(SUM(CASE WHEN type_heure = 'TP' THEN duree ELSE 0 END), 0) as total_tp
                    FROM heures_effectuees WHERE enseignant_id = ?
                `, [ens.id], (err, results) => {
                    if (err) reject(err);
                    else resolve(results[0]);
                });
            });

            const heures_complementaires = Math.max(0, heures.total_heures - ens.heures_contractuelles);
            const montant_total = heures.total_heures * ens.taux_horaire;

            const ligne = feuille.addRow({
                nom: ens.nom,
                prenom: ens.prenom,
                grade: ens.grade,
                departement: ens.departement,
                total_heures: heures.total_heures,
                total_cm: heures.total_cm,
                total_td: heures.total_td,
                total_tp: heures.total_tp,
                heures_contractuelles: ens.heures_contractuelles,
                heures_complementaires,
                taux_horaire: ens.taux_horaire,
                montant_total
            });

            ligne.eachCell(cell => {
                cell.alignment = { horizontal: 'center' };
            });
        }

        res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
        res.setHeader('Content-Disposition', 'attachment; filename=heures-enseignants.xlsx');

        await workbook.xlsx.write(res);
        res.end();

    } catch (erreur) {
        console.error('Erreur export Excel :', erreur);
        res.status(500).json({ message: 'Erreur export Excel' });
    }
};

// ==================== EXPORT PDF ====================
exports.exporterPDF = (req, res) => {
    try {
        const doc = new PDFDocument({ margin: 40 });

        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', 'attachment; filename=heures-enseignants.pdf');

        doc.pipe(res);

        // En-tête
        doc.fontSize(20).fillColor('#1a2a4a').text('TimeEduc', { align: 'center' });
        doc.fontSize(14).fillColor('#f0c027').text('État global des heures enseignants', { align: 'center' });
        doc.moveDown();
        doc.fontSize(10).fillColor('#888').text(`Généré le : ${new Date().toLocaleDateString('fr-FR')}`, { align: 'right' });
        doc.moveDown();

        db.query(`
            SELECT e.id, u.nom, u.prenom, e.grade, e.departement, 
                   e.taux_horaire, e.heures_contractuelles,
                   COALESCE(SUM(h.duree), 0) as total_heures,
                   COALESCE(SUM(CASE WHEN h.type_heure = 'CM' THEN h.duree ELSE 0 END), 0) as total_cm,
                   COALESCE(SUM(CASE WHEN h.type_heure = 'TD' THEN h.duree ELSE 0 END), 0) as total_td,
                   COALESCE(SUM(CASE WHEN h.type_heure = 'TP' THEN h.duree ELSE 0 END), 0) as total_tp
            FROM enseignants e
            JOIN utilisateurs u ON e.utilisateur_id = u.id
            LEFT JOIN heures_effectuees h ON h.enseignant_id = e.id
            GROUP BY e.id
        `, (err, enseignants) => {
            if (err) {
                doc.end();
                return;
            }

            enseignants.forEach((ens, index) => {
                const heures_complementaires = Math.max(0, ens.total_heures - ens.heures_contractuelles);
                const montant_total = ens.total_heures * ens.taux_horaire;

                doc.fontSize(12).fillColor('#1a2a4a').text(`${index + 1}. ${ens.nom} ${ens.prenom}`);
                doc.fontSize(10).fillColor('#444')
                    .text(`   Grade : ${ens.grade} | Département : ${ens.departement}`)
                    .text(`   CM : ${ens.total_cm}h | TD : ${ens.total_td}h | TP : ${ens.total_tp}h | Total : ${ens.total_heures}h`)
                    .text(`   H. complémentaires : ${heures_complementaires}h | Montant : ${montant_total.toLocaleString('fr-FR')} FCFA`);

                doc.moveDown(0.5);
                doc.moveTo(40, doc.y).lineTo(550, doc.y).strokeColor('#f0c027').stroke();
                doc.moveDown(0.5);
            });

            doc.end();
        });

    } catch (erreur) {
        console.error('Erreur export PDF :', erreur);
        res.status(500).json({ message: 'Erreur export PDF' });
    }
};