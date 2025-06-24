import { readFileSync, writeFileSync } from 'fs'
import https from 'https'

interface HolidayResponse {
  holiday: {
    name: string
    date: string
  }
}

function fetchNextHoliday(): Promise<{ name: string; dateStr: string; daysLeft: number }> {
  return new Promise((resolve, reject) => {
    https
      .get('https://timor.tech/api/holiday/next', (res) => {
        let data = ''
        res.on('data', (chunk) => (data += chunk))
        res.on('end', () => {
          try {
            const json: HolidayResponse = JSON.parse(data)
            const name = json.holiday.name
            const dateStr = json.holiday.date
            const holidayDate = new Date(dateStr)
            const now = new Date()
            const daysLeft = Math.ceil((holidayDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
            resolve({ name, dateStr, daysLeft })
          } catch (error) {
            reject(error)
          }
        })
      })
      .on('error', reject)
  })
}

function updateReadme({ name, dateStr, daysLeft }: { name: string; dateStr: string; daysLeft: number }) {
  const readmePath = 'README.md'
  const templateStart = '<!-- holiday-start -->'
  const templateEnd = '<!-- holiday-end -->'

  const readme = readFileSync(readmePath, 'utf-8')
  const newContent = `${templateStart}
📅 下一个节假日是：**${name} (${dateStr})**

⏳ 距离还有：**${daysLeft} 天**
${templateEnd}`

  const updated = readme.replace(new RegExp(`${templateStart}[\\s\\S]*?${templateEnd}`, 'g'), newContent)

  writeFileSync(readmePath, updated)
}

fetchNextHoliday().then(updateReadme).catch(console.error)
