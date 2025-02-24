const express = require('express');
const router = express.Router();
const conn = require('../database/connect/mariadb');

router
    .route('/') 
    .post((req, res) => { // 노트 생성
    const { users_id, title, contents, tag } = req.body;

    const query = `INSERT INTO notes (users_id, title, contents, tag) VALUES (?, ?, ?, ?)`;

    conn.query(query, [users_id, title, contents, tag], (err, results) => {
        if (err) {
            
            res.status(500).json({ message: '노트 작성 실패' });
        }
            res.status(201).json({
            message: '노트 작성 성공',
            insertId: results.insertId
            });
        });
    })
    .get((req, res) => { // 노트 전체 조회
        const query = 'SELECT id, title FROM notes';

        conn.query(query, (err, results) => {
            if (err) {
                res.status(404).json({
                    message : '노트가 하나도 없습니다!'
                })
            } res.status(200).json({
                    message : '노트 조회 성공',
                    notes : results
                });
            
        });
        
    });

router
    .route('/:id')
    .get((req, res) => { // 노트 개별 조회
        const {id} = req.params;

        const query = 'SELECT * FROM notes WHERE id = ?';

        conn.query(query, [id], (err, results) => {
            if (err || results.length === 0) {
                res.status(404).json({
                    message : '노트를 찾을 수 없습니다.'
                })
            } res.status(200).json({
                message : `${id}번 노트입니다.`,
                notes : results
            });
        });
    })

    .delete((req, res) => { // 노트 개별 삭제
        const {id} = req.params;

        const query = 'DELETE FROM notes WHERE id = ?'

        conn.query(query, [id], (err, results) => {
            if (err || results.length === 0) {
                res.status(404).json({
                    message : `${id}번 노트는 존재하지 않습니다.`
                }) 
            } 
            res.status(200).json({
                message : `${id}번 노트가 삭제되었습니다.`
            });
        });
    })

    .put((req, res) => {
        const {id} = req.params;
        const {title, contents, tag} = req.body;

        const query = `UPDATE notes SET title = COALESCE(?, title),
        contents = COALESCE(?, contents), tag = COALESCE(?, tag) WHERE id = ?`;

        conn.query(query, [title, contents, tag, id], (err, results) => {
            if (err || results.affectedRows === 0) {
                res.status(404).json({ 
                    message:  `${id}번 노트는 존재하지 않거나 수정되지 않았습니다.` 
                });
            }
            res.status(200).json({
                message: `${id}번 노트가 수정되었습니다.`
            });
        });        
    })





module.exports = router;