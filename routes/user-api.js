const express = require('express');
const { body, validationResult } = require('express-validator');
const router = express.Router();
const conn = require('../database/connect/mariadb');
const jwt = require('jsonwebtoken');
require('dotenv').config();

const validate = (req, res, next) => {
    const err = validationResult(req)

    if (err.isEmpty()) {
        return next();
    } else {
        return res.status(400).json(err.array())
    }
}

router
    .route('/join')  
    .post(
        [
            body('name').notEmpty().isString().withMessage('이름을 확인해주세요.'),
            body('email').notEmpty().isEmail().withMessage('이메일을 확인해주세요.'),
            body('password').notEmpty().isString().withMessage('비밀번호를 확인해주세요'),
            body('contact').notEmpty().isString().withMessage('연락처를 확인해주세요'),
            validate
        ]
        ,(req, res) => { 
        const { name, email, password, contact } = req.body

        const query =  `INSERT INTO users (email, name, password, contact) VALUES (?, ?, ?, ?)`;

        conn.query(query, [email, name, password, contact], (err, results) => {
            if (err) {
                res.status(400).json({
                    message : '회원 가입 실패'
                });
            }
            res.status(201).json({
                message : `${name}님 환영합니다`,
                userId : results.insertId
            });
        })
    })

router
    .route('/login') 
    .post(
        [
            body('email').notEmpty().isEmail().withMessage('이메일을 확인해주세요'),
            body('password').notEmpty().isString().withMessage('비밀번호를 확인해주세요'),
            validate
        ]
        ,(req, res) => {
        const { email, password } = req.body;

        const query = `SELECT * FROM users WHERE email = ?`;

        conn.query(query, email, (err, results) => {
            if (err) {
                res.status(500).json({
                    message : '로그인 실패'
                }).end()
            }

            const loginUser = results[0];

            if (loginUser && loginUser.password === password) {
                const token = jwt.sign({ 
                    email : loginUser.email, 
                    name : loginUser.name
                }, process.env.PRIVATE_KEY, {
                    expiresIn : '30m',
                    issuer : 'hyemin'
                });

                res.cookie("token", token, {
                    httpOnly : true
                })

                res.status(200).json({
                    message : `${loginUser.name}님 환영합니다!`
                })
            } else {
                res.status(403).json({
                    message : '이메일 또는 비밀번호가 틀렸습니다.',
                    
                })
            }
        })
    })

    module.exports = router;