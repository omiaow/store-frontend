import './AboutPage.css'
import quokkaImg from './images/quokka.png'

function AboutPage() {
  return (
    <div className="client-about">
      <div className="client-about-card">
        <img className="client-about-logo" src={quokkaImg} alt="Quokka" />
        <div className="client-about-text">
          Это приложение помогает открыть онлайн заведение с системой бронирования.
        </div>

        <a
          className="client-about-cta"
          href="https://t.me/QuokkaCrmBot"
          target="_blank"
          rel="noreferrer"
        >
          Начать 🚀
        </a>
      </div>
    </div>
  )
}

export default AboutPage

