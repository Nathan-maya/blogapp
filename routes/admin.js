const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
require('../models/Categoria');
const Categoria = mongoose.model('categorias');

router.get('/', (req, res) => {
  res.render('admin/index');
});
router.get('/posts', (req, res) => {
  res.send('Página de posts');
});
router.get('/categorias', (req, res) => {
  //Lista todos os documentos que existem
  Categoria.find()
    .lean()
    .sort({ date: 'desc' })
    .then((categorias) => {
      res.render('admin/categorias', { _categorias: categorias });
    })
    .catch((erro) => {
      req.flash('erro_msg', 'Houve um erro ao listar as categorias');
      res.redirect('/admin');
    });
});
router.get('/categorias/add', (req, res) => {
  res.render('admin/addcategorias');
});
router.post('/categorias/nova', (req, res) => {
  var erros = [];
  if (
    !req.body.nome ||
    typeof req.body.nome == undefined ||
    req.body.nome == null
  ) {
    erros.push({ texto: 'Nome Inválido' });
  }

  if (
    !req.body.slug ||
    typeof req.body.slug == undefined ||
    req.body.slug == null
  ) {
    erros.push({ texto: 'Slug Inválido!' });
  }
  if (req.body.nome.length < 2) {
    erros.push({ texto: 'Nome da categoria é muito pequeno!' });
  }

  if (erros.length > 0) {
    res.render('admin/addcategorias', { erros: erros });
  } else {
    const novaCategoria = {
      nome: req.body.nome,
      slug: req.body.slug,
    };

    new Categoria(novaCategoria)
      .save()
      .then(() => {
        req.flash('success_msg', 'Categoria criada com sucesso!');
        res.redirect('/admin/categorias');
      })
      .catch((erro) => {
        req.flash(
          'error_msg',
          'Houve um erro ao salvar a categoria, tente novamente!',
          res.redirect('/admin'),
        );
        console.log('Erro ao salvar categoria');
      });
  }
});
router.get('/categorias/edit/:id', (req, res) => {
  Categoria.findOne({ _id: req.params.id })
    .lean()
    .then((categoria) => {
      res.render('admin/editcategoria', { _categoria: categoria });
    })
    .catch((erro) => {
      req.flash('error_msg', 'Essa categoria não existe');
      res.redirect('/admin/categorias');
    });
});
router.post('/categorias/edit', (req, res) => {
  Categoria.findOne({ _id: req.body.id })
    .then((categoria) => {
      categoria.nome = req.body.nome;
      categoria.slug = req.body.slug;

      categoria
        .save()
        .then(() => {
          req.flash('success_msg', 'Categoria editada com sucesso!');
          res.redirect('/admin/categorias');
        })
        .catch((erro) => {
          req.flash(
            'error_msg',
            'Houve um erro interno ao salvar a edição da categoria',
          );
          res.redirect('/admin/categorias');
        });
    })
    .catch((erro) => {
      req.flash('erro_msg', 'Houve um erro ao editar a categoria');
      res.redirect('/admin/categorias');
    });
});

router.post('/categorias/deletar', (req, res) => {
  Categoria.deleteOne({ _id: req.body.id })
    .then(() => {
      req.flash('success_msg', 'Categoria deletada com sucesso!');
      res.redirect('/admin/categorias');
    })
    .catch((erro) => {
      req.flash('error_msg', 'Houve um erro ao deletar a categoria!');
      res.redirect('/admin/categorias');
    });
});

router.get('/postagens', (req, res) => {
  res.render('admin/postagens');
});
router.get('/postagens/add', (req, res) => {
  Categoria.find()
    .lean()
    .then((categorias) => {
      res.render('admin/addpostagem', { _categorias: categorias });
    })
    .catch((erro) => {
      req.flash(
        'error_msg',
        'Houve um erro ao carregar formulário! Tente novamente mais tarde.',
        res.redirect('/admin')
      );
    });
});
module.exports = router;
