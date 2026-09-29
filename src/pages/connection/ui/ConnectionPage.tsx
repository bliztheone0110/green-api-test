import { ConnectionForm } from '@/features/connect-instance'
import type { ConnectInstance } from '@/features/connect-instance'
import { Icon } from '@/shared/ui'
import styles from './ConnectionPage.module.css'

interface ConnectionPageProps {
  onConnect: ConnectInstance
}

export function ConnectionPage({ onConnect }: ConnectionPageProps) {
  return (
    <main className={styles.page}>
      <div className={styles.layout}>
        <section
          className={styles.intro}
          aria-labelledby="welcome-title"
        >
          <div className={styles.brand}>
            <span className={styles.brandMark}>
              <Icon name="chat" />
            </span>
            {' '}
            <span className={styles.tag}>
              TELEGRAM-ЧАТ
            </span>
          </div>
          <div className={styles.pitch}>
            <h1 id="welcome-title">
              Тестовое задание
              <br />
              в green-api
              <br />
              <span>
                Филоненко А.С.
              </span>
            </h1>
            <p>
              Ваши диалоги в Telegram — в одном спокойном пространстве. Только вы, собеседник и самое важное.
            </p>
            <div
              className={styles.sample}
              aria-hidden="true"
            >
              <div className={styles.sampleIncoming}>
                Привет! Есть минутка?
                <small>
                  12:40
                </small>
              </div>
              <div className={styles.sampleOutgoing}>
                Конечно, я на связи
                <small>
                  12:41 ✓
                </small>
              </div>
            </div>
          </div>
          <div className={styles.footnote}>
            <span />
            {' '}
            Работает через GREEN-API
          </div>
        </section>
        <section
          className={styles.card}
          aria-labelledby="connection-title"
        >
          <span className={styles.step}>
            НАЧНЁМ ЗНАКОМСТВО
          </span>
          <h2 id="connection-title">
            Подключите Telegram
          </h2>
          <p className={styles.description}>
            Введите ID и API-токен вашего инстанса из личного кабинета GREEN-API.
          </p>
          <ConnectionForm onConnect={onConnect} />
          <p className={styles.caption}>
            <Icon
              name="lock"
              width="15"
              height="15"
            />
            {' '}
            Данные остаются в памяти текущего сеанса.
          </p>
        </section>
      </div>
    </main>
  )
}
