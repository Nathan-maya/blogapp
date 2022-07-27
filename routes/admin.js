const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
require('../models/Categoria');
const Categoria = mongoose.model('categorias');
require('../models/Postagem');
const Postagem = mongoose.model('postagens');


router.get('/',(req, res) => {
  res.render('admin/index');
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
router.get('/categorias/add',(req, res) => {
  res.render('admin/addcategorias');
});
router.post('/categorias/nova',(req, res) => {
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
router.get('/categorias/edit/:id',(req, res) => {
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
router.post('/categorias/edit',(req, res) => {
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
  Postagem.find()
    .lean()
    .populate({ path: 'categoria', strictPopulate: false }) //especificando para pegar o nome relacionado a categoria
    .sort({ data: 'desc' })
    .then((postagens) => {
      res.render('admin/postagens', { _postagens: postagens });
    })
    .catch((erro) => {
      req.flash('error_msg', 'Houve um erro ao listar as postagens' + erro);
      res.redirect('/admin');
    });
});
//QUANDO USUARIO CLICAR EM NOVA POSTAGEM:
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
        res.redirect('/admin'),
      );
    });
});
//Mandando as informações para o banco de dados:
router.post('/postagens/nova', (req, res) => {
  var erros = [];

  if (req.body.categoria == '0') {
    erros.push({ text: 'Categoria inválida, registre uma categoria' });
  }
  if (erros.length > 0) {
    res.render('/admin/addpostagem', { erros: erros });
  } else {
    //Passando para o objeto os valores obtidos:
    const novaPostagem = {
      titulo: req.body.titulo,
      descricao: req.body.descricao,
      conteudo: req.body.conteudo,
      categoria: req.body.categoria,
      slug: req.body.slug,
    };
    //Adicionando os valores obtidos ao banco de dados
    new Postagem(novaPostagem)
      .save()
      .then(() => {
        req.flash('success_msg', 'Postagem criada com sucesso!');
        //redirecionando o usuario para a pagina postagens
        res.redirect('/admin/postagens');
      })
      .catch((erro) => {
        req.flash(
          'error_msg',
          'Houve um erro durante o salvamento da postagem!',
        );
        res.redirect('/admin/postagens');
      });
  }
});
//Editando postagem
router.get('/postagens/edit/:id', (req, res) => {
  //Coletando os dados e preenchendo os campos input
  Postagem.findOne({ _id: req.params.id })
    .lean()
    .then((postagem) => {
      Categoria.find()
        .lean()
        .then((categorias) => {
          res.render('admin/editpostagens', {
            _categorias: categorias,
            _postagem: postagem,
          });
        })
        .catch((erro) => {
          req.flash('error_msg', 'Houve um erro ao listar as categorias');
          res.redirect('/admin/postagens');
        });
    })
    .catch((erro) => {
      req.flash('error_msg', 'Houve um erro ao carregar formulário de edição ');
      res.redirect('/admin/postagens');
    });
});
//Inserindo novos valores ao banco;
router.post('/postagem/edit', (req, res) => {
  Postagem.findOne({ _id: req.body.id })
    .then((postagem) => {
      (postagem.titulo = req.body.titulo),
        (postagem.slug = req.body.slug),
        (postagem.descricao = req.body.descricao),
        (postagem.conteudo = req.body.conteudo),
        (postagem.categoria = req.body.categoria);

      postagem
        .save()
        .then(() => {
          req.flash('success_msg', 'Postagem editada com sucesso!');
          //Redirecionando para pagina postagens
          res.redirect('/admin/postagens');
        })
        .catch((erro) => {
          req.flash('error_msg', 'Erro interno!');
          res.redirect('/admin/postagens');
        });
    })
    .catch((erro) => {
      req.flash('error_msg', 'Houve um erro ao salvar a edição!' + erro);
      res.redirect('/admin/postagens');
    });
});

//TREINANDO OUTRO MÉTODO DE DELETAR
// RECOMENDADO USAR POST, GET NÃO É SEGURO
router.get('/postagens/deletar/:id', (req, res) => {
  Postagem.remove({ _id: req.params.id })
    .then(() => {
      req.flash('success_msg', 'Postagem deletada com sucesso!');
      res.redirect('/admin/postagens');
    })
    .catch((error) => {
      req.flash('error_msg', 'Houve um erro ao deletar a postagem');
      res.redirect('/admin/postagens');
    });
});
module.exports = router;
