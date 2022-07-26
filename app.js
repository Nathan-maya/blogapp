//CARREGANDO MÓDULOS
const express = require('express');
const handlebars = require('express-handlebars');
const app = express();
const admin = require('./routes/admin');
const path = require('path'); //padrão
const mongoose = require('mongoose');
const session = require('express-session');
const flash = require('connect-flash');//TIPO DE SESSAO QUE SO APARECE UMA VEZ!ao carregar msg, e recarregar pagina ele some

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
app.engine('handlebars', handlebars.engine({ defaultLayout: 'main' }));
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
app.use('/admin', admin);
//Outros
const PORT = 8081;
app.listen(PORT, () => {
  console.log('Servidor Rodando!');
});
