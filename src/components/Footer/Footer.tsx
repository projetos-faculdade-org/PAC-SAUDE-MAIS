import './Footer.css'


const Footer = () => {
  return (

<footer className='footer'>

    <div className='footer-top'>

        <a href="/" className='logo-footer'>
            <img src="/jaraguasaudavel.png" alt="Logo" />
        </a>

        <div className='links'>

        <div className='coluna'>
            <a href="https://jaraguamaissaudavel.org.br/contato/">Contate-nos</a>
            <a href="https://jaraguamaissaudavel.org.br/jms/#nossa-historia">Nossa história</a>
            <a href="https://jaraguamaissaudavel.org.br/jms/">Conheça o Projeto</a>
            <a href="https://jaraguamaissaudavel.org.br/jms/#equipe">Equipe</a>
        </div>

        <div className='coluna'>
            <p>Redes Sociais</p>
            <a href="https://www.linkedin.com/company/jaraguamaissaudavel/">Linkedin</a>
            <a href="https://www.instagram.com/jaraguamaissaudavel">Instagram</a>
            <a href="https://www.facebook.com/JaraguaMaisSaudavel/">Facebook</a>
            <a href="https://open.spotify.com/show/5HKgY8GV9i1HoIa5M3zPaI?si=3e73569f19934f58&nd=1&dlsi=ad3bc0b5d08a4eee">Spotify</a>
            <a href="https://www.youtube.com/@Jaraguamaissaudavel">Youtube</a>
        </div>

        </div>

    </div>

    <div className='separator'></div>

    <div className='direitos'>
        <p>©2025 Jaraguá Mais Saudável. Todos os direitos reservados.</p>
    </div>

</footer>
  )
}

export default Footer
