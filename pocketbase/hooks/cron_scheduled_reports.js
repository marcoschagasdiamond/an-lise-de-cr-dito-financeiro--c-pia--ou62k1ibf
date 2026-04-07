cronAdd('send_scheduled_reports', '0 8 * * *', () => {
  try {
    const schedules = $app.findRecordsByFilter('report_schedules', 'active = true')
    const now = new Date()

    for (const schedule of schedules) {
      const freq = schedule.get('frequency')
      const lastRunStr = schedule.getString('last_run')
      let shouldRun = false

      if (!lastRunStr) {
        shouldRun = true
      } else {
        const lastRun = new Date(lastRunStr)
        const diffDays = (now.getTime() - lastRun.getTime()) / (1000 * 3600 * 24)

        if (freq === 'weekly' && diffDays >= 7) shouldRun = true
        if (freq === 'monthly' && diffDays >= 28) shouldRun = true
      }

      if (shouldRun) {
        console.log('Generating and sending report for user:', schedule.getString('user_id'))

        // Mock sending emails to stakeholders
        const stakeholderIds = schedule.getStringSlice('stakeholders')
        console.log(`Sending to ${stakeholderIds.length} stakeholders.`)

        // Update last_run
        const isoDate = now.toISOString().replace('T', ' ').substring(0, 19) + 'Z'
        schedule.set('last_run', isoDate)
        $app.save(schedule)
      }
    }
  } catch (err) {
    console.error('Cron scheduled reports error:', err)
  }
})
