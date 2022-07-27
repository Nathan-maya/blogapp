//CARREGANDO MÓDULOS
const express = require('express');
const handlebars = require('express-handlebars');
const app = express();
const admin = require('./routes/admin');
const path = require('path'); //padrão
const mongoose = require('mongoose');
const session = require('express-session');
const flash = require('connect-flash'); //TIPO DE SESSAO QUE SO APARECE UMA VEZ!ao carregar msg, e recarregar pagina ele some
require('./models/Postagem');
const Postagem = mongoose.model('postagens');
require('./models/Categoria');
const Categoria = mongoose.model('categorias');
const moment = require('moment');
const usuarios = require('./routes/usuario')

//Configurações
app.use(
  session({
    secret: 'cursodenode',
    resave: true,
    saveUninitialized: true,
  }),
);
app.use(flash());
//Middleware
app.use((req, res, next) => {
  // variaveis globais
  res.locals.success_msg = req.flash('success_msg');
  res.locals.error_msg = req.flash('error_msg');
  next();
});
//BODY PARSER
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
//HandleBars
app.engine(
  'handlebars',
  handlebars.engine({
    defaultLayout: 'main',
    helpers: {
      formatDate: (date) => {
        return moment(date).format('DD/MM/YYYY');
      },
    },
  }),
);
app.set('view engine', 'handlebars');
//mongoose
mongoose.Promise = global.Promise;
mongoose
  .connect('mongodb://localhost/blogapp')
  .then(() => {
    console.log('Conectado ao MongoDB');
  })
  .catch((erro) => {
    console.log(`Erro ao se conectar no MongoDB: ${erro}`);
  });
//Public
app.use(express.static(path.join(__dirname, 'public')));

//Rotas
app.get('/', (req, res) => {
  Postagem.find()
    .lean()
    .populate('categoria')
    .sort({ data: 'desc' })
    .then((postagens) => {
      res.render('index', { _postagens: postagens });
    })
    .catch((erro) => {
      req.flash('error_msg', 'Houve um erro interno');
      res.redirect('/404');
    });
});
app.get('/postagem/:slug', (req, res) => {
  Postagem.findOne({ slug: req.params.slug })
    .lean()
    .then((postagem) => {
      if (postagem) {
        res.render('postagem/index', { _postagem: postagem });
      } else {
        req.flash('error_msg', 'Esta Postagem não existe');
        res.redirect('/');
      }
    })
    .catch((erro) => {
      req.flash('error_msg', 'Houve um erro interno');
      res.redirect('/');
    });
});

app.get('/categorias', (req, res) => {
  Categoria.find()
    .lean()
    .then((categorias) => {
      //Renderizando pagina e passando dados de categorias
      res.render('categorias/index', { _categorias: categorias });
    })
    .catch((error) => {
      req.flash('error_msg', 'Houve um erro interno ao listar as categorias!');
      req.redirect('/');
    });
});

app.get('/categorias/:slug', (req, res) => {
  Categoria.findOne({ slug: req.params.slug })
    .lean()
    .then((categoria) => {
      if (categoria) {
        Postagem.find({ categoria: categoria._id })
          .lean()
          .then((postagens) => {
            res.render('categorias/postagens', {
              postagens: postagens,
              categoria: categoria,
            });
          })
          .catch((error) => {
            req.flash('error_msg', 'Houve um erro ao listar os posts');
            res.redirect('/');
          });
      } else {
        req.flash('error_msg', 'Está categoria não existe');
        res.redirect('/');
      }
    })
    .catch((erro) => {
      req.flash(
        'error_msg',
        'Houve um erro interno ao carregar a pagina desta categoria',
      );
      res.redirect('/');
    });
});

app.get('/404', (res, req) => {
  res.send('Error 404!');
});
app.get('/posts', (req, res) => {
  res.send('Página de posts');
});
app.use('/admin', admin);
app.use('/usuarios',usuarios)
//Outros
const PORT = 8081;
app.listen(PORT, () => {
  console.log('Servidor Rodando!');
});
