const IMG = "https://blogger.googleusercontent.com/img/b/R29vZ2xl";

export const site = {
  name: "Centro de Formación Académica Cartesian Languages CA",
  shortName: "Cartesian Languages",
  description:
    "Servicios de Traducción y Redacción Académica-Profesional, aplicando Lenguajes Especializados de Regulación (LER). Transformamos ideas complejas en contenido reflexivo y conciso. Aplicamos técnicas de comunicación asertiva a través del método lógico-deductivo Cartesiano garantizando una comunicación global, integral y de calidad.",
  blogger: "https://cfacartesianlanguages.blogspot.com",
  url: process.env.NEXT_PUBLIC_SITE_URL ?? "https://cartesian-languages.vercel.app",
  logo: "https://blogger.googleusercontent.com/img/a/AVvXsEiLQqh1Jdl4st7Z6odRDLADjZ_9cwfHGyxOCB3hjnEZYVEQ1B_7kvcX6K7fizbGRkkDph76bBrKLDvKFHT1hxj6ggYIyd82TYTaBVql-ngdtwFmlqHfuF8qyGUPWz4vWpT9e201h9MiIaIi4Zz57pzUoS3TMO7muwVKhH4NwlHGNij0no6qcYEsWQfGc-k=s1600",
  whatsapp:
    "https://wa.me/351935639418?text=Hola%2C%20deseo%20informaci%C3%B3n%20sobre%20sus%20servicios%20ling%C3%BC%C3%ADsticos%20en%20cuanto%20a%3A%0A1)%20Idiomas%0A2)%20Traducci%C3%B3n%0A3)%20Redacci%C3%B3n%0A4)%20Oratoria%0A5)%20Dise%C3%B1o%20de%20Logos",
  chatbot: {
    name: "Cartesian Dkarbeg 5:18",
    title: "René Descartes: IA Racionalista",
    url: "https://entecognitae-cartesiandkarbeg-518.hf.space",
    avatar: `${IMG}/AVvXsEjSY_PiQADrcRPVgUVkkrS-ANeBvrjCjrq38IzWZCxJj35ks7INS3NL3Nuj7QrPOkz7Rh2v-KmYz43glJL7OModCIGSIxMf-u7qQx6Q8_SD2BDWR0LnHOxhodz-mlM7pVzSO9W3XIbsSgNeDbUv3hyvPX7Drew_3EyD41hEuY7SL7In_a4WITQla75dIy4/s320/System%20Prompt.png`,
  },
  services: ["Idiomas", "Traducción", "Redacción", "Oratoria", "Diseño de Logos"],
  blogs: {
    casos: "https://casosempiricoscartesianos.blogspot.com",
    cursos: "https://cartesianlanguagescourses.blogspot.com",
  },
  links: [
    { label: "Casos Empíricos Cartesianos", href: "/casos" },
    { label: "Cartesian Languages Courses", href: "/cursos" },
  ],
  social: [
    { name: "YouTube", href: "https://www.youtube.com/channel/UCNhQ4ZJWOhdTb2BZV9Uqpxg?sub_confirmation=1", icon: `${IMG}/AVvXsEgGxjm__TS1-sOnf69Vbppx-u8CX1ltlmqqtDey3Gml5aV2kZ1BJsK94hMPF-cn870hd7Jk1bx9E50oPbA1fanb90M_2eoVUnnlSQ-Q_axbKVsDmsla6hPg-mRT-9FsPx0coSeVLmQppAbN/s0/Youtube-icono.png` },
    { name: "Facebook", href: "https://www.facebook.com/cartesianlaguages.518/", icon: `${IMG}/AVvXsEh6vlV5enwWRJSXPWHkLi_QEhcy0OAwMgVAqp4F0dvu5sJ5zMBOSAPoqw4ZrMk6GaS_YUtjrK6p_qrHJipWOJz_Ib3NIppNWwx8se0fmswGW1YhYOT4lzTZXssDtPNuzZ7KxvJGR3RDarUt/s0/facebook-icono.png` },
    { name: "Instagram", href: "https://www.instagram.com/cfa.cartesianlanguagesca", icon: `${IMG}/AVvXsEioycSf-8NI3Ff15eeXtdXUO4e888671ildrsPBjKJnTFjzSymZi95xweZpk0Vc6zll0WDyE0pBGj3PWL564QS8VkRxeh_PbW6y6sT9dWJq-xHh1ohUJN737-Qe-c12TRC2kUAbf7TBzxK5/s0/Instagram-icono.png` },
    { name: "WhatsApp", href: "https://wa.me/351935639418", icon: `${IMG}/AVvXsEh1fwppWJk-Z8OVvyOtTxSxBmUMIt702HOt6OSOCVtrKG5GLxCRnPxu6bSj0GDEI3q-FugFOkb82rCvBYMYeM0648TQOjJk9-nFbI4hkOLTpDY3qL-qga9HPTB052Eqay4w3hHZnmW6lENj/s0/whatsapp-icono.png` },
    { name: "TikTok", href: "https://www.tiktok.com/@cfa.cartesian.languages", icon: `${IMG}/AVvXsEiFv8UKZ1-41VtEZOmOWZfuQSeNlkHBnbzmMYBIWVbiiEPWv28j9QmxHUOKceoGNe-6XEk31OnWLoNj-nTWrAK8mba-yMPPEqZlLMj3AI3_nnygxwxamLLKrALutw3nRMaDE2_Hzl7MLcWH/s0/tiktok-icono-oscuro.png` },
    { name: "X", href: "https://x.com/home", icon: `${IMG}/AVvXsEhIg2tj8k49hok_zk9DG0mZ8nJlR_dS8ETeVBD9111J2Gpn8OJjlw9xPxuR-aIPqcb0aIJNxLNxgFmqNx5IG-X5TCGacOFT8S8gwVTBs1gnGUz3xiIkhgXNYu1zQIvW57TXEmk9wwr7Yg9jQxVRZGqL1FzeLyhmg9jR7SX11M3WTih3FN7yuJ2p0r8G0Gh9/s1600/logo-x.png` },
    { name: "LinkedIn", href: "https://www.linkedin.com/in/cartesianlanguagesca/", icon: `${IMG}/AVvXsEjn6a6UmXgZ4HhV5EHAOqB52QP_DFWCoJSpc9D7hkh6B1RrACmlPnOM377n7T4FybdNIzRZvd5K_Qhzy6L6BkMh7VErO_ROxx05xabVZwgARg_-eKthOXqdSjEYv3__m1LjZhetLJWyOSO8/s0-rw/linkedIn.icono.png` },
  ],
  podcast: {
    title: "Cartesian Podcast",
    subtitle: "Oráculo Escocés Cartesiano",
    episodes: [
      { slug: "Venezuela-Sismica", name: "Venezuela Sísmica" },
      { slug: "rene-descartes-el-filosofo-de-la-duda-dario-sztajnszrajber-el-arte-de-filosofar-480p-h-264-youtube", name: "René Descartes: El Filósofo de la Duda" },
      { slug: "aprende-a-decir-no-sin-sentir-culpa", name: "Aprende a decir no sin sentir culpa" },
      { slug: "descifra-gestos-mentiras-y-hackea-tu-cerebro", name: "Descifra gestos, mentiras y hackea tu cerebro" },
      { slug: "los-desautomatas-del-lenguaje", name: "Los Desautómatas del Lenguaje" },
      { slug: "el-lenguaje-anti-ia", name: "El Lenguaje Anti IA" },
      { slug: "la-creatividad-infinitadel-lenguaje-humano", name: "La creatividad infinita del lenguaje humano" },
      { slug: "la-precision-logica-contra-el-lenguaje-vivo", name: "La precisión lógica contra el lenguaje vivo" },
      { slug: "por-que-la-validez-no-requiere-verdad", name: "Por qué la validez no requiere verdad" },
      { slug: "the-infinite-creativity-of-human-language_202602", name: "The Infinite Creativity of Human Language" },
      { slug: "la-transusbtanciacion-del-lenguaje", name: "La transubstanciación del lenguaje" },
    ],
  },
};

/** Estructura del menú original: sección → subcategorías (etiquetas de Blogger). */
export const sections = [
  { title: "Pensamientos", label: "Pensamientos", children: ["Epístolar Cartesiana", "Pensamientos Epistémico Cartesiano"] },
  { title: "Ciencia del Lenguaje", label: "Ciencia del Lenguaje", children: ["Gramática Cartesiana", "Semántica Cartesiana", "Sintaxis Cartesiana"] },
  { title: "Traducción e Interpretación", label: "Traducción e Interpretación", children: ["Traducción", "Interpretación"] },
  { title: "Ortología del Lenguaje", label: "Ortología del Lenguaje", children: ["Fonética", "Fonología"] },
  { title: "El Rincón de la Lengua", label: "El Rincón de la Lengua Cartesiana (Columna Investigativa)", children: [] },
];
