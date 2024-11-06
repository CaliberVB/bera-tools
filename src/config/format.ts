export const format = {
  en: {
    dateFormat: 'YYYY-MM-DD',
    dateTimeFormat: 'YYYY-MM-DD HH:mm',
    shortDateTimeFormat: 'MM-DD HH:mm',
  },
}

type EnvironmentShape = {
  authKey: string
  localeKey: string
}

export const config: EnvironmentShape = {
  authKey: 'AUTH_KEY',
  localeKey: 'LOCALE_KEY',
}
