const { readFileSync, writeFileSync } = require('fs')
const https = require('https')

function fetchNextHoliday() {
  return new Promise((resolve, reject) => {
    https
      .get('https://timor.tech/api/holiday/next', (res) => {
        let data = ''
        res.on('data', (chunk) => (data += chunk))
        res.on('end', () => {
          try {
            const { holiday } = JSON.parse(data)
            const { name, date, rest } = holiday ?? {}
            resolve({ name, date, rest })
          } catch (error) {
            reject(error)
          }
        })
      })
      .on('error', reject)
  })
}

function getTheRemainingDaysFromNextYear() {
  const today = new Date()
  const nextYear = today.getFullYear() + 1
  const nextYearFirstDay = new Date(nextYear, 0, 1)
  const diffTime = nextYearFirstDay - today
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
  return diffDays
}

function updateReadme({ name, date, rest }) {
  const readmePath = 'README.md'
  const templateStart = '<!-- holiday-start -->'
  const templateEnd = '<!-- holiday-end -->'

  const readme = readFileSync(readmePath, 'utf-8')
  const nextName = `${name ?? '元旦节'} (${date ?? `${new Date().getFullYear() + 1}-01-01`})`
  const newContent = `${templateStart}
📅 下一个节假日是：**${nextName}**

⏳ 距离还有：**${rest ?? getTheRemainingDaysFromNextYear()} 天**
${templateEnd}`

  const updated = readme.replace(new RegExp(`${templateStart}[\\s\\S]*?${templateEnd}`, 'g'), newContent)

  writeFileSync(readmePath, updated)
}

fetchNextHoliday().then(updateReadme).catch(console.error)
