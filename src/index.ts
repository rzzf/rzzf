import { readFileSync, writeFileSync } from 'fs'
import https from 'https'

interface HolidayResponse {
  holiday: {
    name: string
    date: string
    rest: number
  }
}

interface Holiday {
  name: string
  date: string
  rest: number
}

function fetchNextHoliday(): Promise<Holiday> {
  return new Promise((resolve, reject) => {
    https
      .get('https://timor.tech/api/holiday/next', (res) => {
        let data = ''
        res.on('data', (chunk) => (data += chunk))
        res.on('end', () => {
          try {
            const {
              holiday: { name, date, rest },
            } = JSON.parse(data) as HolidayResponse
            resolve({ name, date, rest })
          } catch (error) {
            reject(error)
          }
        })
      })
      .on('error', reject)
  })
}

function updateReadme({ name, date, rest }: Holiday) {
  const readmePath = 'README.md'
  const templateStart = '<!-- holiday-start -->'
  const templateEnd = '<!-- holiday-end -->'

  const readme = readFileSync(readmePath, 'utf-8')
  const newContent = `${templateStart}
📅 下一个节假日是：**${name} (${date})**

⏳ 距离还有：**${rest} 天**
${templateEnd}`

  const updated = readme.replace(new RegExp(`${templateStart}[\\s\\S]*?${templateEnd}`, 'g'), newContent)

  writeFileSync(readmePath, updated)
}

fetchNextHoliday().then(updateReadme).catch(console.error)
