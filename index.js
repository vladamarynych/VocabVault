import path from "path";
import dotenv from "dotenv";
import express from "express";
import bodyParser from "body-parser";
import bcrypt from "bcryptjs";
import session from "express-session";
import axios from "axios";
import schedule from "node-schedule";
import pkg from "pg";
const { Pool } = pkg;

const app = express();

import { dirname } from "path";
import { fileURLToPath } from "url";
const __dirname = dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.resolve(__dirname, "./.env") });

const port = process.env.PORT;

app.set("views", path.join(__dirname, "views"));
app.set("view engine", "ejs");

const pool = new Pool({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_NAME,
  password: process.env.DB_PASSWORD,
  port: process.env.DB_PORT,
});

pool.connect();

app.use(
  session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: true,
    cookie: { secure: false },
  })
);

app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.json());
app.use(express.static(path.join(__dirname, "public")));

const testData = {
  languages: ["Spanish", "French"],
  questions: {
    spanish: [
      {
        text: "¿Cómo te llamas?",
        answers: ["Me llamo María", "Tengo 20 años", "Buenos días"],
        correct: 0,
      },

      {
        text: "¿Cuál es el color del cielo en un día soleado?",
        answers: ["Azul", "Verde", "Rojo"],
        correct: 0,
      },
      {
        text: "Completa la frase: 'Hoy ____ frío'",
        answers: ["tengo", "está", "hace"],
        correct: 2,
      },
      {
        text: "¿Qué significa la palabra 'biblioteca'?",
        answers: [
          "Un lugar donde se venden libros",
          "Un lugar donde se prestan libros",
          "Un lugar donde se fabrican libros",
        ],
        correct: 1,
      },
      {
        text: "¿Cuál es el pasado simple de 'ir'?",
        answers: ["Iba", "Fui", "Voy"],
        correct: 1,
      },
      {
        text: "Elige la opción correcta: 'Si tuviera tiempo, ______ al cine'",
        answers: ["voy", "iría", "fui"],
        correct: 1,
      },
      {
        text: "¿Qué figura retórica está presente en esta frase? 'El tiempo es oro'",
        answers: ["Metáfora", "Hipérbole", "Ironía"],
        correct: 0,
      },
      {
        text: "¿Cuál es el significado de 'en vano'?",
        answers: [
          "Algo que no tiene sentido",
          "Algo que cuesta mucho",
          "Algo que es divertido",
        ],
        correct: 0,
      },
      {
        text: "¿Cómo se dice 'to overcome a challenge' en español?",
        answers: [
          "Sobrellevar un problema",
          "Superar un desafío",
          "Enfrentar un miedo",
        ],
        correct: 1,
      },
    ],
    french: [
      {
        text: "Comment tu t'appelles ?",
        answers: ["Je m'appelle Pierre", "J'ai 25 ans", "Bonsoir"],
        correct: 0,
      },
      {
        text: "Quelle est la couleur du ciel par temps ensoleillé ?",
        answers: ["Bleu", "Vert", "Rouge"],
        correct: 0,
      },
      {
        text: "Complétez la phrase : 'Aujourd'hui il ____ froid'.",
        answers: ["fait", "est", "a"],
        correct: 0,
      },
      {
        text: "Que signifie le mot 'bibliothèque' ?",
        answers: [
          "Un lieu où on vend des livres",
          "Un lieu où on prête des livres",
          "Un lieu où on fabrique des livres",
        ],
        correct: 1,
      },
      {
        text: "Quel est le passé composé de 'aller' ?",
        answers: ["Allé", "Va", "Allais"],
        correct: 0,
      },
      {
        text: "Choisissez la bonne option : 'Si j'avais le temps, je ______ au cinéma'.",
        answers: ["vais", "irais", "suis allé"],
        correct: 1,
      },
      {
        text: "Quelle figure de style est présente dans cette phrase : 'Le temps, c'est de l'argent' ?",
        answers: ["Métaphore", "Hyperbole", "Ironie"],
        correct: 0,
      },
      {
        text: "Que signifie l'expression 'en vain' ?",
        answers: [
          "Quelque chose sans succès",
          "Quelque chose de cher",
          "Quelque chose d'amusant",
        ],
        correct: 0,
      },
      {
        text: "Comment dit-on 'to overcome a challenge' en français ?",
        answers: [
          "Surmonter un défi",
          "Affronter un problème",
          "Traverser une peur",
        ],
        correct: 0,
      },
    ],
  },
};

const frequentWords = {
  es: [
    //Nature
    "jungla",
    "bosque",
    "desierto",
    "lago",
    "volcán",
    "isla",
    "cascada",
    "nube",
    "arena",
    "horizonte",
    "gruta",
    "océano",
    "pradera",
    "selva",
    "agua",
    "árbol",
    "flor",
    "montaña",
    "río",
    "mar",
    "playa",
    "tierra",
    "cielo",
    "sol",
    "estrella",
    "luna",
    "viento",
    "fuego",
    // Emotions
    "ansiedad",
    "confianza",
    "curiosidad",
    "determinación",
    "gratitud",
    "indiferencia",
    "melancolía",
    "orgullo",
    "soledad",
    "vergüenza",
    "amor",
    "alegría",
    "tristeza",
    "miedo",
    "esperanza",
    "odio",
    "felicidad",
    "sorpresa",
    "envidia",
    "culpa",
    "orgullo",
    // Food
    "aceite",
    "ajo",
    "cebolla",
    "pimienta",
    "sal",
    "azúcar",
    "chocolate",
    "pastel",
    "huevo",
    "leche",
    "harina",
    "miel",
    "yogur",
    "caldo",
    "pan",
    "queso",
    "carne",
    "pollo",
    "pescado",
    "arroz",
    "fruta",
    "verdura",
    "manzana",
    "naranja",
    "plátano",
    "tomate",
    "agua",
    "café",
    "té",
    "vino",
    // Travel
    "museo",
    "puerto",
    "autobús",
    "metro",
    "parque",
    "crucero",
    "turista",
    "guía",
    "maleta",
    "excursión",
    "aventura",
    "destino",
    "mapa",
    "viajero",
    "avión",
    "tren",
    "coche",
    "bicicleta",
    "hotel",
    "ciudad",
    "país",
    "mapa",
    "aeropuerto",
    "playa",
    "pasaporte",
    "vacaciones",
    // Numbers
    "uno",
    "dos",
    "tres",
    "cuatro",
    "cinco",
    "seis",
    "siete",
    "ocho",
    "nueve",
    "diez",
    "once",
    "doce",
    "trece",
    "catorce",
    "quince",
    "veinte",
    "cincuenta",
    "cien",
    "mil",
    "millón",
    // Days, months
    "lunes",
    "martes",
    "miércoles",
    "jueves",
    "viernes",
    "sábado",
    "domingo",
    "enero",
    "febrero",
    "marzo",
    "abril",
    "mayo",
    "junio",
    "julio",
    "agosto",
    "septiembre",
    "octubre",
    "noviembre",
    "diciembre",
    // Basic verbs
    "enseñar",
    "aprender",
    "construir",
    "destruir",
    "cantar",
    "bailar",
    "nadar",
    "dibujar",
    "cocinar",
    "estudiar",
    "viajar",
    "comprar",
    "vender",
    "mirar",
    "usar",
    "ser",
    "tener",
    "hacer",
    "ir",
    "decir",
    "ver",
    "comer",
    "beber",
    "vivir",
    "pensar",
    "trabajar",
    "jugar",
    "leer",
    "escribir",
    "caminar",
    // Adjectives
    "bonito",
    "feo",
    "amable",
    "cruel",
    "inteligente",
    "tonto",
    "alto",
    "bajo",
    "luminoso",
    "oscuro",
    "nuevo",
    "antiguo",
    "barato",
    "caro",
    "limpio",
    "sucio",
    "grande",
    "pequeño",
    "bueno",
    "malo",
    "feliz",
    "triste",
    "fácil",
    "difícil",
    "rápido",
    "lento",
    "nuevo",
    "viejo",
    "caliente",
    "frío",
    // Clothes
    "camisa",
    "pantalones",
    "zapatos",
    "sombrero",
    "chaqueta",
    "vestido",
    "falda",
    "corbata",
    "guantes",
    "bufanda",
    "bolso",
    "cinturón",
  ],
  fr: [
    // Nature
    "jungle",
    "forêt",
    "désert",
    "lac",
    "volcan",
    "île",
    "cascade",
    "nuage",
    "sable",
    "horizon",
    "grotte",
    "océan",
    "prairie",
    "savane",
    "eau",
    "arbre",
    "fleur",
    "montagne",
    "rivière",
    "mer",
    "plage",
    "terre",
    "ciel",
    "soleil",
    "étoile",
    "lune",
    "vent",
    "feu",
    // Emotions
    "anxiété",
    "confiance",
    "curiosité",
    "détermination",
    "gratitude",
    "indifférence",
    "mélancolie",
    "fierté",
    "solitude",
    "honte",
    "amour",
    "joie",
    "tristesse",
    "peur",
    "espoir",
    "haine",
    "bonheur",
    "surprise",
    "jalousie",
    "culpabilité",
    "fierté",
    // Food
    "huile",
    "ail",
    "oignon",
    "poivre",
    "sel",
    "sucre",
    "chocolat",
    "gâteau",
    "œuf",
    "lait",
    "farine",
    "miel",
    "yaourt",
    "bouillon",
    "pain",
    "fromage",
    "viande",
    "poulet",
    "poisson",
    "riz",
    "fruit",
    "légume",
    "pomme",
    "orange",
    "banane",
    "tomate",
    "eau",
    "café",
    "thé",
    "vin",
    // Travel
    "musée",
    "port",
    "bus",
    "métro",
    "parc",
    "croisière",
    "touriste",
    "guide",
    "valise",
    "excursion",
    "aventure",
    "destination",
    "plan",
    "voyageur",
    "avion",
    "train",
    "voiture",
    "vélo",
    "hôtel",
    "ville",
    "pays",
    "carte",
    "aéroport",
    "plage",
    "passeport",
    "vacances",
    // Numbers
    "un",
    "deux",
    "trois",
    "quatre",
    "cinq",
    "six",
    "sept",
    "huit",
    "neuf",
    "dix",
    "onze",
    "douze",
    "treize",
    "quatorze",
    "quinze",
    "vingt",
    "cinquante",
    "cent",
    "mille",
    "million",
    // Days, months
    "lundi",
    "mardi",
    "mercredi",
    "jeudi",
    "vendredi",
    "samedi",
    "dimanche",
    "janvier",
    "février",
    "mars",
    "avril",
    "mai",
    "juin",
    "juillet",
    "août",
    "septembre",
    "octobre",
    "novembre",
    "décembre",
    // Basic verbs
    "être",
    "avoir",
    "faire",
    "aller",
    "dire",
    "voir",
    "manger",
    "boire",
    "vivre",
    "penser",
    "travailler",
    "jouer",
    "lire",
    "écrire",
    "marcher",
    "enseigner",
    "apprendre",
    "construire",
    "détruire",
    "chanter",
    "danser",
    "nager",
    "dessiner",
    "cuisiner",
    "étudier",
    "voyager",
    "acheter",
    "vendre",
    "regarder",
    "utiliser",
    // Adjectives
    "grand",
    "petit",
    "bon",
    "mauvais",
    "heureux",
    "triste",
    "facile",
    "difficile",
    "rapide",
    "lent",
    "nouveau",
    "vieux",
    "chaud",
    "froid",
    "joli",
    "laid",
    "gentil",
    "cruel",
    "intelligent",
    "stupide",
    "grand",
    "petit",
    "lumineux",
    "sombre",
    "neuf",
    "ancien",
    "bon marché",
    "cher",
    "propre",
    "sale",
    // Clothes
    "chemise",
    "pantalon",
    "chaussures",
    "chapeau",
    "veste",
    "robe",
    "jupe",
    "cravate",
    "gants",
    "écharpe",
    "sac",
    "ceinture",
  ],
};

const improvementQuestions = {
  languages: ["Spanish", "French"],
  currentlevels: ["A1", "A2", "B1", "B2", "C1", "C2"],
  spanish: {
    vocabulary: {
      A1: [
        {
          text: "¿Cómo se dice 'apple' en español?",
          answers: ["Manzana", "Pera", "Naranja", "Uva"],
          correct: "0",
        },
        {
          text: "¿Qué significa 'perro' en inglés?",
          answers: ["Cat", "Dog", "Bird", "Fish"],
          correct: "1",
        },
        {
          text: "Selecciona la palabra que significa 'house' en español:",
          answers: ["Casa", "Carro", "Silla", "Mesa"],
          correct: "0",
        },
        {
          text: "¿Cuál es el plural de 'gato'?",
          answers: ["Gatoss", "Gatas", "Gatos", "Gatoes"],
          correct: "2",
        },
        {
          text: "¿Cómo se dice 'blue' en español?",
          answers: ["Azul", "Rojo", "Verde", "Amarillo"],
          correct: "0",
        },
        {
          text: "¿Qué significa 'comida' en inglés?",
          answers: ["Meal", "Drink", "Dessert", "Food"],
          correct: "3",
        },
        {
          text: "¿Cómo se llama el color del cielo?",
          answers: ["Azul", "Negro", "Blanco", "Gris"],
          correct: "0",
        },
        {
          text: "¿Qué significa 'libro' en inglés?",
          answers: ["Book", "Pen", "Paper", "Notebook"],
          correct: "0",
        },
        {
          text: "Selecciona la palabra que significa 'chair' en español:",
          answers: ["Puerta", "Mesa", "Cama", "Silla"],
          correct: "3",
        },
        {
          text: "¿Cómo se dice 'school' en español?",
          answers: ["Casa", "Hospital", "Escuela", "Parque"],
          correct: "2",
        },
      ],
      A2: [
        {
          text: "¿Qué significa 'zapatos' en inglés?",
          answers: ["Shoes", "Socks", "Shirt", "Pants"],
          correct: "0",
        },
        {
          text: "¿Cómo se dice 'tree' en español?",
          answers: ["Bosque", "Planta", "Flor", "Árbol"],
          correct: "3",
        },
        {
          text: "Selecciona la palabra que significa 'window' en español:",
          answers: ["Ventana", "Puerta", "Pared", "Techo"],
          correct: "0",
        },
        {
          text: "¿Qué significa 'viaje' en inglés?",
          answers: ["Path", "Car", "Trip", "Journey"],
          correct: "2",
        },
        {
          text: "¿Cómo se dice 'to run' en español?",
          answers: ["Correr", "Saltar", "Caminar", "Hablar"],
          correct: "0",
        },
        {
          text: "¿Qué significa 'hermoso' en inglés?",
          answers: ["Happy", "Beautiful", "Angry", "Big"],
          correct: "1",
        },
        {
          text: "Selecciona la palabra que significa 'kitchen' en español:",
          answers: ["Baño", "Cocina", "Sala", "Comedor"],
          correct: "1",
        },
        {
          text: "¿Cómo se dice 'cloud' en español?",
          answers: ["Cielo", "Lluvia", "Nube", "Sol"],
          correct: "2",
        },
        {
          text: "¿Qué significa 'camisa' en inglés?",
          answers: ["Shirt", "Pants", "Shoes", "Hat"],
          correct: "0",
        },
        {
          text: "Selecciona la palabra que significa 'city' en español:",
          answers: ["Ciudad", "Pueblo", "País", "Barrio"],
          correct: "0",
        },
      ],
      B1: [
        {
          text: "¿Qué significa 'desafío' en inglés?",
          answers: ["Challenge", "Difficulty", "Success", "Adventure"],
          correct: "0",
        },
        {
          text: "¿Cómo se dice 'to improve' en español?",
          answers: ["Cambiar", "Peorar", "Mejorar", "Intentar"],
          correct: "2",
        },
        {
          text: "Selecciona la palabra que significa 'forest' en español:",
          answers: ["Campo", "Bosque", "Montaña", "Lago"],
          correct: "1",
        },
        {
          text: "¿Qué significa 'amistad' en inglés?",
          answers: ["Friendship", "Happiness", "Love", "Care"],
          correct: "0",
        },
        {
          text: "¿Cómo se dice 'healthy' en español?",
          answers: ["Enfermo", "Saludable", "Feliz", "Seguro"],
          correct: "1",
        },
        {
          text: "¿Qué significa 'problema' en inglés?",
          answers: ["Issue", "Solution", "Question", "Problem"],
          correct: "3",
        },
        {
          text: "Selecciona la palabra que significa 'advice' en español:",
          answers: ["Secreto", "Información", "Orden", "Consejo"],
          correct: "3",
        },
        {
          text: "¿Cómo se dice 'to dream' en español?",
          answers: ["Soñar", "Dormir", "Despertar", "Pensar"],
          correct: "0",
        },
        {
          text: "¿Qué significa 'cariñoso' en inglés?",
          answers: ["Sweet", "Kind", "Affectionate", "Happy"],
          correct: "2",
        },
        {
          text: "Selecciona la palabra que significa 'goal' en español:",
          answers: ["Plan", "Meta", "Sueño", "Deseo"],
          correct: "1",
        },
      ],
      B2: [
        {
          text: "¿Qué significa 'mantenimiento' en inglés?",
          answers: ["Maintenance", "Construction", "Operation", "Repair"],
          correct: "0",
        },
        {
          text: "¿Cómo se dice 'to emphasize' en español?",
          answers: ["Enfatizar", "Simplificar", "Complicar", "Exagerar"],
          correct: "0",
        },
        {
          text: "Selecciona la palabra que significa 'weakness' en español:",
          answers: ["Debilidad", "Fortaleza", "Dificultad", "Peligro"],
          correct: "0",
        },
        {
          text: "¿Qué significa 'conocimiento' en inglés?",
          answers: ["Learning", "Knowledge", "Education", "Understanding"],
          correct: "1",
        },
        {
          text: "¿Cómo se dice 'to recommend' en español?",
          answers: ["Recomendar", "Aconsejar", "Sugerir", "Advertir"],
          correct: "0",
        },
        {
          text: "¿Qué significa 'oportunidad' en inglés?",
          answers: ["Option", "Chance", "Risk", "Opportunity"],
          correct: "3",
        },
        {
          text: "Selecciona la palabra que significa 'failure' en español:",
          answers: ["Error", "Éxito", "Fracaso", "Problema"],
          correct: "2",
        },
        {
          text: "¿Cómo se dice 'to develop' en español?",
          answers: ["Innovar", "Construir", "Desarrollar", "Crear"],
          correct: "2",
        },
        {
          text: "¿Qué significa 'crecimiento' en inglés?",
          answers: ["Growth", "Increase", "Development", "Progress"],
          correct: "0",
        },
        {
          text: "Selecciona la palabra que significa 'achievement' en español:",
          answers: ["Logro", "Meta", "Objetivo", "Éxito"],
          correct: "0",
        },
      ],
      C1: [
        {
          text: "¿Qué significa 'sostenibilidad' en inglés?",
          answers: ["Stability", "Sustainability", "Strength", "Durability"],
          correct: "1",
        },
        {
          text: "¿Cómo se dice 'to advocate' en español?",
          answers: ["Proponer", "Abogar", "Declarar", "Explicar"],
          correct: "1",
        },
        {
          text: "Selecciona la palabra que significa 'endeavor' en español:",
          answers: ["Esfuerzo", "Intento", "Proyecto", "Trabajo"],
          correct: "0",
        },
        {
          text: "¿Qué significa 'relevancia' en inglés?",
          answers: ["Significance", "Importance", "Priority", "Relevance"],
          correct: "3",
        },
        {
          text: "¿Cómo se dice 'to acknowledge' en español?",
          answers: ["Reconocer", "Admitir", "Aceptar", "Entender"],
          correct: "0",
        },
        {
          text: "¿Qué significa 'perspectiva' en inglés?",
          answers: ["Opinion", "View", "Perspective", "Idea"],
          correct: "2",
        },
        {
          text: "Selecciona la palabra que significa 'resilience' en español:",
          answers: ["Adaptación", "Fuerza", "Resiliencia", "Resistencia"],
          correct: "2",
        },
        {
          text: "¿Cómo se dice 'to enlighten' en español?",
          answers: ["Informar", "Explicar", "Enseñar", "Iluminar"],
          correct: "3",
        },
        {
          text: "¿Qué significa 'disposición' en inglés?",
          answers: ["Disposition", "Attitude", "Willingness", "Order"],
          correct: "0",
        },
        {
          text: "Selecciona la palabra que significa 'insight' en español:",
          answers: ["Idea", "Perspicacia", "Conocimiento", "Opinión"],
          correct: "1",
        },
      ],
      C2: [
        {
          text: "¿Qué significa 'trascendencia' en inglés?",
          answers: ["Transcendence", "Importance", "Relevance", "Meaning"],
          correct: "0",
        },
        {
          text: "¿Cómo se dice 'to epitomize' en español?",
          answers: ["Epitomar", "Representar", "Reflejar", "Demostrar"],
          correct: "0",
        },
        {
          text: "Selecciona la palabra que significa 'paradigm' en español:",
          answers: ["Paradigma", "Modelo", "Ejemplo", "Patrón"],
          correct: "0",
        },
        {
          text: "¿Qué significa 'escepticismo' en inglés?",
          answers: ["Doubt", "Skepticism", "Criticism", "Analysis"],
          correct: "1",
        },
        {
          text: "¿Cómo se dice 'to substantiate' en español?",
          answers: ["Demostrar", "Probar", "Sustanciar", "Fundamentar"],
          correct: "2",
        },
        {
          text: "¿Qué significa 'congruencia' en inglés?",
          answers: ["Agreement", "Coherence", "Congruence", "Connection"],
          correct: "2",
        },
        {
          text: "Selecciona la palabra que significa 'inference' en español:",
          answers: ["Conclusión", "Inferencia", "Idea", "Entendimiento"],
          correct: "1",
        },
        {
          text: "¿Cómo se dice 'to synthesize' en español?",
          answers: ["Simplificar", "Analizar", "Procesar", "Sintetizar"],
          correct: "3",
        },
        {
          text: "¿Qué significa 'enunciado' en inglés?",
          answers: ["Statement", "Announcement", "Expression", "Proposition"],
          correct: "0",
        },
        {
          text: "Selecciona la palabra que significa 'nuance' en español:",
          answers: ["Matiz", "Detalle", "Diferencia", "Aspecto"],
          correct: "0",
        },
      ],
    },
    grammar: {
      A1: [
        {
          text: "What is the correct indefinite article for 'coche'?",
          answers: ["una", "un", "unos"],
          correct: "1",
        },
        {
          text: "How do you say 'I am' in Spanish?",
          answers: ["Soy", "Eres", "Estamos"],
          correct: "0",
        },
        {
          text: "Which is the correct plural form of 'libro'?",
          answers: ["libres", "libroes", "libros"],
          correct: "2",
        },
        {
          text: "How do you say 'good morning' in Spanish?",
          answers: ["Buenas tardes", "Buenas noches", "Buenos días"],
          correct: "2",
        },
        {
          text: "How do you say 'thank you' in Spanish?",
          answers: ["Gracias", "Por favor", "De nada"],
          correct: "0",
        },
        {
          text: "Which verb means 'to eat'?",
          answers: ["Beber", "Comer", "Vivir"],
          correct: "1",
        },
        {
          text: "What is the correct translation for 'cat' in Spanish?",
          answers: ["Ratón", "Perro", "Gato"],
          correct: "2",
        },
        {
          text: "What is the feminine form of 'amigo'?",
          answers: ["amigas", "amiga", "amigos"],
          correct: "1",
        },
        {
          text: "Which word means 'house' in Spanish?",
          answers: ["Casa", "Mesa", "Puerta"],
          correct: "0",
        },
        {
          text: "How do you say 'goodbye' in Spanish?",
          answers: ["Hola", "Adiós", "Gracias"],
          correct: "1",
        },
      ],

      A2: [
        {
          text: "Which is the correct conjugation of 'hablar' for 'nosotros'?",
          answers: ["Hablo", "Hablan", "Hablamos"],
          correct: "2",
        },
        {
          text: "What is the correct form of 'tener' for 'tú'?",
          answers: ["Tienes", "Tiene", "Tienen"],
          correct: "0",
        },
        {
          text: "What is the past tense of 'yo como'?",
          answers: ["Yo comí", "Yo comiendo", "Yo comer"],
          correct: "0",
        },
        {
          text: "How do you say 'My name is' in Spanish?",
          answers: ["Mi nombre es", "Me llamo", "Me llamas"],
          correct: "1",
        },
        {
          text: "Which word means 'beautiful' in Spanish?",
          answers: ["Feo", "Bonito", "Corto"],
          correct: "1",
        },
        {
          text: "Which preposition means 'with' in Spanish?",
          answers: ["Sin", "Con", "Sobre"],
          correct: "1",
        },
        {
          text: "What is the correct way to say 'I like apples'?",
          answers: [
            "Me gusta la manzana",
            "Me gustan las manzanas",
            "Yo gusto las manzanas",
          ],
          correct: "0",
        },
        {
          text: "What is the plural form of 'pez'?",
          answers: ["Pez", "Pezes", "Peces"],
          correct: "2",
        },
        {
          text: "How do you say 'you are welcome' in Spanish?",
          answers: ["De nada", "Gracias", "Por favor"],
          correct: "0",
        },
        {
          text: "Which verb means 'to learn'?",
          answers: ["Correr", "Escribir", "Aprender"],
          correct: "2",
        },
      ],

      B1: [
        {
          text: "Which is the correct conjugation of 'vivir' for 'yo' in the present tense?",
          answers: ["Vivo", "Vive", "Viví"],
          correct: "0",
        },
        {
          text: "What is the past tense of 'ellos van'?",
          answers: ["Ellos van", "Ellos fueron", "Ellos iban"],
          correct: "1",
        },
        {
          text: "How do you say 'We are eating' in Spanish?",
          answers: ["Comemos", "Estamos comiendo", "Comeremos"],
          correct: "1",
        },
        {
          text: "Which word means 'quickly' in Spanish?",
          answers: ["Rápidamente", "Lentamente", "Fácilmente"],
          correct: "0",
        },
        {
          text: "How do you say 'I have eaten' in Spanish?",
          answers: ["Había comido", "He comido", "Como"],
          correct: "1",
        },
        {
          text: "What is the correct translation for 'She likes to dance'?",
          answers: [
            "Le gusta bailar",
            "Ella gusta bailar",
            "A ella le gusta bailar",
          ],
          correct: "2",
        },
        {
          text: "Which is the correct way to express obligation in Spanish?",
          answers: ["Hacer que", "Deber de", "Tener que"],
          correct: "2",
        },
        {
          text: "How do you form the future tense for 'yo estudiar'?",
          answers: ["Estudiaré", "Estudiaría", "Estudio"],
          correct: "0",
        },
        {
          text: "What is the subjunctive form of 'hablar' for 'nosotros'?",
          answers: ["Hablemos", "Hablábamos", "Hablaremos"],
          correct: "0",
        },
        {
          text: "Which word means 'however' in Spanish?",
          answers: ["Sin embargo", "Aunque", "Pero"],
          correct: "0",
        },
      ],

      B2: [
        {
          text: "Which is the correct translation for 'If I had money, I would buy a car'?",
          answers: [
            "Si tengo dinero, compraría un coche",
            "Si tuviera dinero, compraría un coche",
            "Si tuviera dinero, compraré un coche",
          ],
          correct: "1",
        },
        {
          text: "How do you say 'She had been working all day' in Spanish?",
          answers: [
            "Ella había trabajado todo el día",
            "Ella estaba trabajando todo el día",
            "Ella había estado trabajando todo el día",
          ],
          correct: "2",
        },
        {
          text: "Which is the correct subjunctive form of 'tener' for 'yo'?",
          answers: ["Tenga", "Tuve", "Tendré"],
          correct: "0",
        },
        {
          text: "What is the difference between 'por' and 'para'?",
          answers: [
            "Para indicates cause, por indicates purpose",
            "Por indicates cause, para indicates purpose",
            "Both mean the same",
          ],
          correct: "1",
        },
        {
          text: "Which sentence correctly uses the imperfect tense?",
          answers: [
            "Cuando era niño, jugaba mucho",
            "Cuando era niño, jugué mucho",
            "Cuando era niño, jugaré mucho",
          ],
          correct: "0",
        },
        {
          text: "What is the conditional form of 'hacer' for 'nosotros'?",
          answers: ["Hará", "Hacemos", "Haríamos"],
          correct: "2",
        },
        {
          text: "How do you form the present perfect subjunctive for 'yo'?",
          answers: ["Haya hecho", "He hecho", "Había hecho"],
          correct: "0",
        },
        {
          text: "Which is the correct translation for 'They will have finished the project'?",
          answers: [
            "Han terminado el proyecto",
            "Habrán terminado el proyecto",
            "Terminarán el proyecto",
          ],
          correct: "1",
        },
        {
          text: "What is the passive voice form of 'Ellos construyen casas'?",
          answers: [
            "Casas construidas por ellos",
            "Ellos son construidos por casas",
            "Casas son construidas por ellos",
          ],
          correct: "2",
        },
        {
          text: "Which is the correct way to say 'Let him speak' in Spanish?",
          answers: ["Que hable", "Que habla", "Hablar"],
          correct: "0",
        },
      ],
      C1: [
        {
          text: "What is the correct translation for 'I wish I had studied more'?",
          answers: [
            "Ojalá hubiera estudiado más",
            "Ojalá estudiaría más",
            "Ojalá estudiara más",
          ],
          correct: "0",
        },
        {
          text: "Which is the correct form of 'ser' in the past perfect subjunctive?",
          answers: ["Hubiera ser", "Había sido", "Hubiera sido"],
          correct: "2",
        },
        {
          text: "How do you say 'It would have been better if they had come'?",
          answers: [
            "Habría sido mejor si hubieran venido",
            "Sería mejor si hubieran venido",
            "Habría sido mejor si venían",
          ],
          correct: "0",
        },
        {
          text: "Which is the correct translation for 'By the time we arrived, they had already left'?",
          answers: [
            "Cuando llegamos, ya se fueron",
            "Para cuando llegamos, ya se habían ido",
            "Cuando lleguemos, ya se habían ido",
          ],
          correct: "1",
        },
        {
          text: "What is the correct way to form an impersonal sentence in Spanish?",
          answers: [
            "Dice que es fácil",
            "Dices que es fácil",
            "Se dice que es fácil",
          ],
          correct: "2",
        },
      ],
      C2: [
        {
          text: "¿Cuál de las siguientes opciones es correcta para expresar una acción que ocurrió en el pasado anterior a otra acción pasada?",
          answers: ["Había cantado", "Cante", "Habrá cantado"],
          correct: "0",
        },
        {
          text: "¿Qué forma verbal usarías para expresar probabilidad en el pasado reciente?",
          answers: ["Habrá salido", "Salió", "Había salido"],
          correct: "0",
        },
        {
          text: "¿Qué significa la oración 'De haberlo sabido, no habría ido'?",
          answers: [
            "If I knew it, I wouldn’t go.",
            "If I had known it, I wouldn’t have gone.",
            "If I know it, I won’t go.",
          ],
          correct: "1",
        },
        {
          text: "¿Cuál es el uso correcto del subjuntivo imperfecto en esta frase? 'Si tú _______ (saber), podrías haber evitado el problema.'",
          answers: ["sabrías", "sabías", "supieras"],
          correct: "2",
        },
        {
          text: "En la oración 'Aunque me lo hubieras pedido, no te habría ayudado', ¿qué expresa 'aunque'?",
          answers: [
            "Contraste real",
            "Contraste hipotético",
            "Probabilidad futura",
          ],
          correct: "1",
        },
      ],
    },
  },
  french: {
    vocabulary: {
      A1: [
        {
          text: "What is the French word for 'apple'?",
          answers: ["pomme", "poire", "banane", "orange"],
          correct: 0,
        },
        {
          text: "What is the French word for 'water'?",
          answers: ["eau", "lait", "vin", "thé"],
          correct: 0,
        },
        {
          text: "How do you say 'thank you' in French?",
          answers: ["bonjour", "merci", "s'il vous plaît", "au revoir"],
          correct: 1,
        },
        {
          text: "What is the French word for 'cat'?",
          answers: ["chien", "chat", "souris", "oiseau"],
          correct: 1,
        },
        {
          text: "What is the French word for 'bread'?",
          answers: ["gâteau", "fromage", "viande", "pain"],
          correct: 3,
        },
        {
          text: "How do you say 'goodbye' in French?",
          answers: ["au revoir", "bonjour", "bonne nuit", "merci"],
          correct: 0,
        },
        {
          text: "What is the French word for 'school'?",
          answers: ["hôpital", "maison", "école", "jardin"],
          correct: 2,
        },
        {
          text: "What is the French word for 'dog'?",
          answers: ["chien", "chat", "oiseau", "poisson"],
          correct: 0,
        },
        {
          text: "How do you say 'please' in French?",
          answers: ["s'il vous plaît", "merci", "bonjour", "pardon"],
          correct: 0,
        },
        {
          text: "What is the French word for 'book'?",
          answers: ["stylo", "livre", "papier", "chaise"],
          correct: 1,
        },
      ],
      A2: [
        {
          text: "What is the French word for 'city'?",
          answers: ["ville", "village", "quartier", "rue"],
          correct: 0,
        },
        {
          text: "What is the French word for 'car'?",
          answers: ["train", "camion", "vélo", "voiture"],
          correct: 3,
        },
        {
          text: "How do you say 'beautiful' in French?",
          answers: ["beau", "grand", "vieux", "jeune"],
          correct: 0,
        },
        {
          text: "What is the French word for 'family'?",
          answers: ["amis", "famille", "collègues", "voisins"],
          correct: 1,
        },
        {
          text: "What is the French word for 'house'?",
          answers: ["immeuble", "maison", "appartement", "chambre"],
          correct: 1,
        },
        {
          text: "How do you say 'happy' in French?",
          answers: ["fatigué", "triste", "heureux", "fâché"],
          correct: 2,
        },
        {
          text: "What is the French word for 'flower'?",
          answers: ["plante", "arbre", "herbe", "fleur"],
          correct: 3,
        },
        {
          text: "What is the French word for 'train'?",
          answers: ["train", "bus", "voiture", "moto"],
          correct: 0,
        },
        {
          text: "How do you say 'friend' in French?",
          answers: ["ami", "voisin", "parent", "connaissance"],
          correct: 0,
        },
        {
          text: "What is the French word for 'music'?",
          answers: ["chanson", "musique", "danse", "film"],
          correct: 1,
        },
      ],
      B1: [
        {
          text: "What does 'chien' mean in English?",
          answers: ["Dog", "Cat", "Bird", "Fish"],
          correct: 0,
        },
        {
          text: "What is the English equivalent of 'maison'?",
          answers: ["Car", "House", "Window", "Tree"],
          correct: 1,
        },
        {
          text: "Translate 'lire' into English.",
          answers: ["To write", "To read", "To sleep", "To eat"],
          correct: 1,
        },
        {
          text: "What does 'argent' mean?",
          answers: ["Money", "Silver", "Gold", "Bank"],
          correct: 0,
        },
        {
          text: "The word 'pain' refers to what in English?",
          answers: ["Pain", "Bread", "Cake", "Meat"],
          correct: 1,
        },
        {
          text: "What does 'boire' mean?",
          answers: ["To drink", "To eat", "To swim", "To speak"],
          correct: 0,
        },
        {
          text: "Translate 'chaise' into English.",
          answers: ["Table", "Chair", "Bed", "Couch"],
          correct: 1,
        },
        {
          text: "What is the meaning of 'soleil'?",
          answers: ["Moon", "Star", "Sun", "Light"],
          correct: 2,
        },
        {
          text: "What does 'jardin' mean in English?",
          answers: ["Garden", "Forest", "Park", "Field"],
          correct: 0,
        },
        {
          text: "The word 'voiture' means what in English?",
          answers: ["Bike", "Plane", "Car", "Train"],
          correct: 2,
        },
      ],

      B2: [
        {
          text: "What does 'beaucoup' mean?",
          answers: ["Enough", "Very", "Many", "Few"],
          correct: 2,
        },
        {
          text: "Translate 'franchement' into English.",
          answers: ["Frankly", "Rarely", "Clearly", "Barely"],
          correct: 0,
        },
        {
          text: "What is the English equivalent of 'améliorer'?",
          answers: ["To fix", "To improve", "To create", "To help"],
          correct: 1,
        },
        {
          text: "The word 'bizarre' means what in English?",
          answers: ["Beautiful", "Strange", "Common", "Usual"],
          correct: 1,
        },
        {
          text: "What does 'confiance' mean in English?",
          answers: ["Confidence", "Trust", "Faith", "Belief"],
          correct: 0,
        },
        {
          text: "Translate 'se débrouiller' into English.",
          answers: ["To struggle", "To confuse", "To learn", "To manage"],
          correct: 3,
        },
        {
          text: "What is the meaning of 'heureux'?",
          answers: ["Happy", "Sad", "Lucky", "Calm"],
          correct: 0,
        },
        {
          text: "The word 'mauvais' refers to what in English?",
          answers: ["Neutral", "Good", "Bad", "Ugly"],
          correct: 2,
        },
        {
          text: "What does 'propre' mean?",
          answers: ["Clean", "Dirty", "Appropriate", "Strange"],
          correct: 0,
        },
        {
          text: "Translate 'remercier' into English.",
          answers: ["To greet", "To thank", "To praise", "To request"],
          correct: 1,
        },
      ],

      C1: [
        {
          text: "What does 'embêter' mean?",
          answers: ["To amuse", "To surprise", "To annoy", "To confuse"],
          correct: 2,
        },
        {
          text: "Translate 'épanouir' into English.",
          answers: ["To relax", "To explain", "To blossom", "To escape"],
          correct: 2,
        },
        {
          text: "What is the English equivalent of 'fâcheux'?",
          answers: ["Happy", "Regrettable", "Impressive", "Confusing"],
          correct: 1,
        },
        {
          text: "The word 'lourdeur' means what in English?",
          answers: ["Heaviness", "Speed", "Laziness", "Silence"],
          correct: 0,
        },
        {
          text: "What does 'soulever' mean in English?",
          answers: ["To open", "To drop", "To break", "To lift"],
          correct: 3,
        },
        {
          text: "Translate 'soupçon' into English.",
          answers: ["Suspicion", "Fear", "Hope", "Surprise"],
          correct: 0,
        },
        {
          text: "What is the meaning of 'surprendre'?",
          answers: ["To surprise", "To stop", "To deceive", "To know"],
          correct: 0,
        },
        {
          text: "The word 'ténacité' refers to what in English?",
          answers: ["Wisdom", "Kindness", "Persistence", "Silence"],
          correct: 2,
        },
        {
          text: "What does 'viser' mean?",
          answers: ["To aim", "To close", "To jump", "To rest"],
          correct: 0,
        },
        {
          text: "Translate 'volonté' into English.",
          answers: ["Strength", "Willpower", "Desire", "Motivation"],
          correct: 1,
        },
      ],

      C2: [
        {
          text: "What does 'apercevoir' mean?",
          answers: ["To notice", "To hear", "To touch", "To forget"],
          correct: 0,
        },
        {
          text: "Translate 'bourrasque' into English.",
          answers: ["Gust of wind", "Storm", "Drizzle", "Hurricane"],
          correct: 3,
        },
        {
          text: "What is the English equivalent of 'éblouissant'?",
          answers: ["Impressive", "Bright", "Dazzling", "Heavy"],
          correct: 2,
        },
        {
          text: "The word 'fébrile' means what in English?",
          answers: ["Feverish", "Calm", "Energetic", "Lazy"],
          correct: 0,
        },
        {
          text: "What does 'inéluctable' mean in English?",
          answers: ["Inevitable", "Avoidable", "Optional", "Unusual"],
          correct: 0,
        },
        {
          text: "Translate 'impuissance' into English.",
          answers: ["Strength", "Powerlessness", "Influence", "Carelessness"],
          correct: 1,
        },
        {
          text: "What is the meaning of 'néfaste'?",
          answers: ["Beneficial", "Harmful", "Neutral", "Delightful"],
          correct: 1,
        },
        {
          text: "The word 'parvenir' refers to what in English?",
          answers: ["To achieve", "To try", "To think", "To leave"],
          correct: 0,
        },
        {
          text: "What does 'réprimer' mean?",
          answers: ["To share", "To express", "To suppress", "To allow"],
          correct: 2,
        },
        {
          text: "Translate 'transparaître' into English.",
          answers: ["To darken", "To vanish", "To show through", "To glow"],
          correct: 2,
        },
      ],
    },
    grammar: {
      A1: [
        {
          text: "Choisissez la forme correcte : Je ___ un livre.",
          answers: ["lire", "lit", "lis"],
          correct: 2,
        },
        {
          text: "Quel article est correct ? ___ pomme est rouge.",
          answers: ["Un", "Une", "Le"],
          correct: 1,
        },
        {
          text: "Complétez la phrase : Nous ___ au parc.",
          answers: ["allons", "aller", "allez"],
          correct: 0,
        },
        {
          text: "Choisissez le pronom correct : C'est ___ chien.",
          answers: ["mon", "moi", "je"],
          correct: 0,
        },
        {
          text: "Quelle préposition est correcte ? Le chat est ___ la table.",
          answers: ["sous", "dans", "sur"],
          correct: 2,
        },
        {
          text: "Sélectionnez la forme plurielle : Un animal, des ___.",
          answers: ["animale", "animales", "animaux"],
          correct: 2,
        },
        {
          text: "Quelle forme de question est correcte ? ___ tu veux un café ?",
          answers: ["Est-ce que", "Est-ce qu'", "Qu'est-ce que"],
          correct: 0,
        },
        {
          text: "Choisissez la forme négative : Il ___ aime pas les légumes.",
          answers: ["ne", "n'", "non"],
          correct: 1,
        },
        {
          text: "Complétez la phrase : Hier, nous ___ au cinéma.",
          answers: ["sommes allés", "allons", "allions"],
          correct: 0,
        },
        {
          text: "Quelle forme verbale est correcte ? Ils ___ souvent du sport.",
          answers: ["fais", "font", "faire"],
          correct: 1,
        },
      ],

      A2: [
        {
          text: "Choisissez la bonne forme : Elle ___ ses devoirs maintenant.",
          answers: ["fait", "faites", "fais"],
          correct: 0,
        },
        {
          text: "Sélectionnez la bonne option : Il ___ toujours ponctuel.",
          answers: ["sont", "est", "était"],
          correct: 1,
        },
        {
          text: "Quelle préposition est correcte ? Nous nous rencontrons ___ lundi.",
          answers: ["au", "le", "à"],
          correct: 1,
        },
        {
          text: "Complétez la phrase : Ils ___ leur repas maintenant.",
          answers: ["mange", "mangez", "mangent"],
          correct: 2,
        },
        {
          text: "Choisissez la forme comparative correcte : Ce livre est ___ que l'autre.",
          answers: ["meilleur", "mieux", "bon"],
          correct: 0,
        },
        {
          text: "Quelle question est correcte ? ___-tu déjà visité Paris ?",
          answers: ["Est-ce que", "Es", "As"],
          correct: 2,
        },
        {
          text: "Sélectionnez l'option correcte : Elle ___ au marché hier.",
          answers: ["va", "est allée", "allait"],
          correct: 1,
        },
        {
          text: "Choisissez la forme négative correcte : Nous ___ mangeons pas de viande.",
          answers: ["n'", "ne", "pas"],
          correct: 1,
        },
        {
          text: "Quelle phrase est correcte ? Vous ___ en train de travailler.",
          answers: ["êtes", "êtes en", "soyez"],
          correct: 0,
        },
        {
          text: "Complétez la phrase : Elle ___ beaucoup de travail chaque jour.",
          answers: ["a", "as", "avait"],
          correct: 0,
        },
      ],

      B1: [
        {
          text: "Choisissez le bon temps : Je ___ ici depuis deux ans.",
          answers: ["vis", "ai vécu", "vivais"],
          correct: 0,
        },
        {
          text: "Complétez la phrase : Si j'___ toi, je m'excuserais.",
          answers: ["étais", "suis", "était"],
          correct: 0,
        },
        {
          text: "Quel mot convient ? Il ___ fini son projet.",
          answers: ["avait", "est", "a"],
          correct: 2,
        },
        {
          text: "Choisissez la forme correcte : Nous ___ à Paris l'année dernière.",
          answers: ["allions", "allons", "sommes allés"],
          correct: 2,
        },
        {
          text: "Quel est le mot correct ? Elle ___ être plus prudente.",
          answers: ["doit", "devait", "devra"],
          correct: 0,
        },
        {
          text: "Quelle préposition est correcte ? Il est intéressé ___ l'art.",
          answers: ["à", "par", "dans"],
          correct: 1,
        },
        {
          text: "Choisissez la bonne option : Le livre ___ écrit par un auteur célèbre.",
          answers: ["a été", "est", "avait été"],
          correct: 0,
        },
        {
          text: "Complétez la phrase : Ils ___ terminé leur travail avant la date limite.",
          answers: ["ont", "avaient", "avaient eu"],
          correct: 1,
        },
        {
          text: "Quelle est la forme correcte ? Il ___ le bus tous les matins.",
          answers: ["prends", "prend", "prenait"],
          correct: 1,
        },
        {
          text: "Choisissez le mot correct : Nous ___ en train d'étudier depuis des heures.",
          answers: ["avons été", "sommes", "avions"],
          correct: 0,
        },
      ],

      B2: [
        {
          text: "Complétez la phrase : Je t'appellerai dès que je ___ les nouvelles.",
          answers: ["aurai", "aurais", "ai"],
          correct: 0,
        },
        {
          text: "Quelle forme est correcte ? Elle a suggéré qu'il ___ plus tôt.",
          answers: ["partirait", "part", "parte"],
          correct: 2,
        },
        {
          text: "Quel est le bon choix ? Il a insisté pour ___ à la réunion.",
          answers: ["assisterait", "d'assister", "assister"],
          correct: 2,
        },
        {
          text: "Choisissez la bonne phrase : Il est grand temps que nous ___.",
          answers: ["partions", "partons", "partirons"],
          correct: 0,
        },
        {
          text: "Complétez la question : ___-vous déjà visité l'Italie ?",
          answers: ["Est-ce que", "Avez", "Aviez"],
          correct: 1,
        },
        {
          text: "Quelle préposition convient ? Elle est capable ___ résoudre des problèmes complexes.",
          answers: ["de", "à", "en"],
          correct: 0,
        },
        {
          text: "Choisissez le bon mot : Le rapport ___ terminé demain.",
          answers: ["sera", "est", "avait été"],
          correct: 0,
        },
        {
          text: "Quelle est la forme correcte ? Ils ___ pendant des heures avant de trouver la réponse.",
          answers: ["ont cherché", "avaient cherché", "cherchaient"],
          correct: 1,
        },
        {
          text: "Quel temps est correct ? Quand elle arrivera, nous ___ fini de manger.",
          answers: ["avons", "aurons", "avions"],
          correct: 1,
        },
        {
          text: "Choisissez la bonne option : Je regrette que je ___ plus de temps à me détendre.",
          answers: ["n'aie pas", "n'ai pas", "avais"],
          correct: 0,
        },
      ],

      C1: [
        {
          text: "Complétez avec la forme correcte : Si j'avais su, je ___ venu plus tôt.",
          answers: ["serais", "aurais", "serai"],
          correct: 0,
        },
        {
          text: "Quelle est l'expression correcte ? Il a fait cela ___.",
          answers: [
            "de sa propre gré",
            "de son propre gré",
            "à son propre gré",
          ],
          correct: 1,
        },
        {
          text: "Choisissez la phrase correctement construite :",
          answers: [
            "C'est la chose de laquelle je me souviens le plus.",
            "C'est la chose que je me souviens le plus.",
            "C'est la chose dont je me souviens le plus.",
          ],
          correct: 2,
        },
        {
          text: "Quelle est la bonne formulation ? Cette décision doit être prise ___ toutes les parties.",
          answers: [
            "en faveur de",
            "de commun accord entre",
            "à l'encontre de",
          ],
          correct: 1,
        },
        {
          text: "Complétez : Il ne pouvait pas s'empêcher ___ à cette situation.",
          answers: ["de rire", "à rire", "de rient"],
          correct: 0,
        },
        {
          text: "Trouvez la phrase correcte :",
          answers: [
            "L'objectif qu'il cherche à atteindre est clair.",
            "L'objectif qu'il cherche atteindre est clair.",
            "L'objectif auquel il cherche d'atteindre est clair.",
          ],
          correct: 0,
        },
        {
          text: "Quel est le bon choix ? Je crains qu'il ne ___ tard.",
          answers: ["soit", "sera", "était"],
          correct: 0,
        },
        {
          text: "Choisissez la bonne préposition : Elle s'intéresse ___ la littérature française.",
          answers: ["de", "à", "en"],
          correct: 1,
        },
        {
          text: "Quelle est l'expression correcte ? Je suis parti ___ tôt ce matin.",
          answers: ["à bonne heure matin", "au bon matin", "de bon matin"],
          correct: 2,
        },
        {
          text: "Trouvez l'erreur :",
          answers: [
            "Elle a dit qu'elle viendrait demain.",
            "Elle a dit qu'elle viendra demain.",
            "Elle a dit qu'elle allait venir demain.",
          ],
          correct: 1,
        },
      ],

      C2: [
        {
          text: "Complétez : Il est important qu'il ___ son travail avant la date limite.",
          answers: ["fasse", "fait", "ferait"],
          correct: 0,
        },
        {
          text: "Choisissez la formulation correcte : Malgré les difficultés, il a tenu ___ sa décision.",
          answers: ["ferme sur", "ferme à", "ferme dans"],
          correct: 1,
        },
        {
          text: "Quelle est la phrase correcte ?",
          answers: [
            "C'est une question à laquelle nous devons réfléchir.",
            "C'est une question laquelle nous devons réfléchir.",
            "C'est une question dont nous devons réfléchir.",
          ],
          correct: 0,
        },
        {
          text: "Trouvez l'expression idiomatique : Il est clair qu'il agit toujours ___.",
          answers: ["à bon escient", "à bonne conscience", "en bon gré"],
          correct: 0,
        },
        {
          text: "Complétez : Je doute qu'il ___ venir à la réunion.",
          answers: ["pouvait", "peut", "puisse"],
          correct: 2,
        },
        {
          text: "Quel est le bon mot pour compléter la phrase ? Il est ___ qu'il n'ait pas compris l'explication.",
          answers: ["probable", "probablement", "probabilité"],
          correct: 0,
        },
        {
          text: "Choisissez la phrase correcte :",
          answers: [
            "Le rapport de lequel il a rédigé est irréprochable.",
            "Le rapport qui il a rédigé est irréprochable.",
            "Le rapport qu'il a rédigé est irréprochable.",
          ],
          correct: 2,
        },
        {
          text: "Complétez la phrase : Bien qu'il ___ fatigué, il a terminé son travail.",
          answers: ["serait", "soit", "fût"],
          correct: 1,
        },
        {
          text: "Trouvez la bonne construction : Il est difficile de dire ___ il sera prêt.",
          answers: ["que", "quand", "auquel"],
          correct: 1,
        },
        {
          text: "Quelle est la meilleure réponse ? Ce n'est pas en criant qu'il ___ le problème.",
          answers: ["résoudra", "résout", "résoudrait"],
          correct: 0,
        },
      ],
    },
  },
};

async function translateWord(word, fromLanguage, toLanguage = "en") {
  try {
    const response = await axios.get(
      `https://translate.googleapis.com/translate_a/single?client=gtx&sl=${fromLanguage}&tl=${toLanguage}&dt=t&q=${encodeURIComponent(
        word
      )}`
    );

    const translatedText = response.data[0][0][0];
    return translatedText;
  } catch (error) {
    console.error(`Error translating word "${word}":`, error.message);
    return "No translation available";
  }
}

async function saveWordsToDatabase(userId, words) {
  const client = await pool.connect();

  try {
    await client.query("BEGIN");

    const validWords = words.filter(
      ({ word, translation }) => word && word.trim().length > 0
    );

    if (validWords.length === 0) {
      console.warn(`No valid words to save for user ${userId}`);
      return;
    }

    const queries = validWords.map(({ word, translation }) =>
      client.query(
        `INSERT INTO user_dictionary (user_id, word, translation) 
         VALUES ($1, $2, $3)
         ON CONFLICT (user_id, word) DO NOTHING`,
        [userId, word, translation || "No translation available"]
      )
    );

    await Promise.all(queries);
    await client.query("COMMIT");
  } catch (error) {
    await client.query("ROLLBACK");
    console.error("Error saving words:", error.message);
  } finally {
    client.release();
  }
}

async function updateUserWords() {
  const client = await pool.connect();

  try {
    const users = await client.query("SELECT id, language FROM users");

    for (const user of users.rows) {
      const userLanguage = user.language;
      const languageCode = userLanguage === "Spanish" ? "es" : "fr";

      const wordsForLanguage = frequentWords[languageCode];

      // Get words already used by the user
      const { rows: existingWords } = await client.query(
        "SELECT word FROM user_dictionary WHERE user_id = $1",
        [user.id]
      );

      const usedWords = new Set(existingWords.map((row) => row.word));

      const newWords = [];

      // Add up to 5 new words for the user
      for (let i = 0; i < wordsForLanguage.length && newWords.length < 5; i++) {
        const word = wordsForLanguage[i];

        if (!usedWords.has(word)) {
          const translation = await translateWord(word, languageCode, "en");
          newWords.push({ word, translation });
          usedWords.add(word); // Update the set to include the new word
        }
      }

      if (newWords.length === 0) {
        console.warn(`No new words to save for user ${user.id}`);
        continue;
      }

      // Store new words for the user
      console.log(`Fetched words for user ${user.id}:`, newWords);
      await saveWordsToDatabase(user.id, newWords);
    }

    console.log("Words updated for all users.");
  } catch (error) {
    console.error("Error updating words:", error.message);
  } finally {
    client.release();
  }
}

schedule.scheduleJob("0 0 * * *", updateUserWords);

function getRandomQuestions(questions, count = 5) {
  const shuffled = questions.sort(() => 0.5 - Math.random());
  return shuffled.slice(0, count);
}

app.get("/", (req, res) => {
  try {
    res.render("login", { errorMessage: null });
  } catch (err) {
    console.log(err);
    return err;
  }
});

app.post("/login", async (req, res) => {
  const { username, password } = req.body;

  try {
    const userQuery = "SELECT * FROM users WHERE username = $1";
    const result = await pool.query(userQuery, [username]);

    if (result.rows.length > 0) {
      const user = result.rows[0];

      const isPasswordValid = await bcrypt.compare(password, user.password);

      if (isPasswordValid) {
        req.session.username = user.username;
        req.session.userId = user.id;
        return res.redirect("/profile");
      } else {
        return res.render("login", { errorMessage: "Invalid password" });
      }
    } else {
      return res.render("login", { errorMessage: "User not found" });
    }
  } catch (err) {
    console.error(err);
    return res.status(500).send("Server error");
  }
});

app.get("/signup", (req, res) => {
  try {
    res.render("signup", { errorMessage: null });
  } catch (err) {
    console.log(err);
    return err;
  }
});

app.post("/signup", async (req, res) => {
  const { username, password, language, currentLevel } = req.body;
  if (!username || !password || !language || !currentLevel) {
    return res.render("signup", {
      errorMessage: "Information are required.",
    });
  }

  try {
    const hashedPassword = await bcrypt.hash(password, 10);

    const insertUserQuery = `
          INSERT INTO users (username, password, language, currentLevel) 
          VALUES ($1, $2, $3, $4) 
          RETURNING *`;
    const insertUserResult = await pool.query(insertUserQuery, [
      username,
      hashedPassword,
      language,
      currentLevel,
    ]);

    const newUser = insertUserResult.rows[0];

    req.session.username = newUser.username;
    req.session.userId = newUser.id;

    return res.status(201).redirect("/profile");
  } catch (err) {
    console.error(err);
    return res.status(500).render("signup", {
      errorMessage: "Server error. Please try again later.",
    });
  }
});

app.get("/profile", async (req, res) => {
  try {
    const userId = req.session.userId;

    if (!userId) {
      return res.redirect("/");
    }

    const query = "SELECT * FROM users WHERE id = $1";
    const result = await pool.query(query, [userId]);

    const query2 = "SELECT COUNT(word) FROM user_dictionary WHERE user_id = $1";
    const result2 = await pool.query(query2, [userId]);

    console.log("User ID:", userId);
    console.log("Result 1:", result.rows);
    console.log("Result 2:", result2.rows);

    if (result.rows.length > 0 && result2.rows.length > 0) {
      const user = result.rows[0];
      const wordCount = result2.rows[0].count;
      return res.render("profile", {
        user,
        wordCount,
        isOwnProfile: true,
      });
    } else {
      return res.status(404).send("User not found");
    }
  } catch (err) {
    console.error(err);
    return res.status(500).send("Server error");
  }
});

app.get("/language-select", (req, res) => {
  res.render("language-select", { languages: testData.languages });
});

app.get("/quiz", (req, res) => {
  const language = req.query.language;
  const questions = testData.questions[language];

  if (!questions) {
    return res.send("No questions available for the selected language.");
  }

  res.render("quiz", { language, questions });
});

app.post("/result", (req, res) => {
  const { language, answers } = req.body;
  const questions = testData.questions[language];

  if (!questions) {
    return res.send("Invalid language selection.");
  }

  let correctAnswers = 0;
  questions.forEach((question, index) => {
    if (parseInt(answers[index]) === question.correct) {
      correctAnswers++;
    }
  });

  const totalQuestions = questions.length;
  const scorePercentage = (correctAnswers / totalQuestions) * 100;

  let level;
  if (scorePercentage >= 80) level = "C1";
  else if (scorePercentage >= 60) level = "B2";
  else if (scorePercentage >= 40) level = "B1";
  else if (scorePercentage >= 30) level = "A2";
  else level = "A1";

  res.render("result", { language, correctAnswers, totalQuestions, level });
});

app.get("/grammarReviewS", (req, res) => {
  res.render("spanishGrammar");
});

app.get("/grammarReviewF", (req, res) => {
  res.render("frenchGrammar");
});

app.get("/dictionary", async (req, res) => {
  const userId = req.session.userId;

  if (!userId) {
    return res.redirect("/login");
  }

  try {
    const result = await pool.query(
      "SELECT word, translation, added_at FROM user_dictionary WHERE user_id = $1 ORDER BY added_at DESC",
      [userId]
    );

    const userResult = await pool.query(
      "SELECT language FROM users WHERE id = $1",
      [userId]
    );

    if (userResult.rows.length === 0) {
      return res.status(404).send("User  not found");
    }

    const userLanguage = userResult.rows[0].language;

    res.render("dictionary", { dictionary: result.rows, userLanguage });
  } catch (err) {
    console.error("Error fetching dictionary:", err.message);
    res.status(500).send("Internal Server Error");
  }
});

app.get("/improvement-select", async (req, res) => {
  try {
    const userId = req.session.userId;

    if (!userId) {
      return res.redirect("/");
    }

    const query = "SELECT * FROM users WHERE id = $1";
    const result = await pool.query(query, [userId]);

    if (result.rows.length > 0) {
      const user = result.rows[0];
      return res.render("improvement-select", { user, isOwnProfile: true });
    } else {
      return res.status(404).send("User not found");
    }
  } catch (err) {
    console.error(err);
    return res.status(500).send("Server error");
  }
});

app.get("/improvement-question", (req, res) => {
  const { language, currentlevel, topic } = req.query;

  if (!language || !currentlevel || !topic) {
    return res
      .status(400)
      .send(
        "Missing required query parameters: language, currentlevel, or topic."
      );
  }

  const allQuestions =
    improvementQuestions[language.toLowerCase()]?.[topic]?.[currentlevel];

  if (!allQuestions || allQuestions.length === 0) {
    return res
      .status(404)
      .send("No questions found for the selected language, level, and topic.");
  }

  const questions = getRandomQuestions(allQuestions, 5);

  res.render("improvement-question", {
    questions,
    language,
    currentlevel,
    topic,
  });
});

app.post("/submit-answers", (req, res) => {
  const { language, currentlevel, topic, answers } = req.body;

  const allQuestions =
    improvementQuestions[language.toLowerCase()][topic][currentlevel];

  let correctCount = 0;

  allQuestions.slice(0, 5).forEach((question, index) => {
    if (parseInt(answers[index]) === parseInt(question.correct)) {
      correctCount++;
    }
  });

  res.redirect(
    `/improvement-result?correct=${correctCount}&total=5&language=${language}&topic=${topic}&currentlevel=${currentlevel}`
  );
});

app.get("/improvement-result", (req, res) => {
  const { correct, total, language, topic, currentlevel } = req.query;

  if (!language) {
    return res.status(400).send("Language is missing from the request.");
  }

  res.render("improvement-result", {
    correct: parseInt(correct),
    total: parseInt(total),
    language,
    topic,
    currentlevel,
  });
});

app.post("/level-up", async (req, res) => {
  const { language, currentlevel } = req.body;
  const userId = req.session.userId;

  const levels = ["A1", "A2", "B1", "B2", "C1", "C2"];
  const nextLevelIndex = levels.indexOf(currentlevel) + 1;

  if (nextLevelIndex >= levels.length) {
    return res.send("You've already reached the highest level!");
  }

  const nextLevel = levels[nextLevelIndex];

  try {
    await pool.query(
      `UPDATE users 
       SET currentlevel = $1 
       WHERE id = $2`,
      [nextLevel, userId]
    );
    res.redirect(`/profile?message=Level%20Up%20Successful`);
  } catch (error) {
    console.error("Error leveling up:", error);
    res.status(500).send("An error occurred while leveling up.");
  }
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
