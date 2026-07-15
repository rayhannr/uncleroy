TLDR: though the extension, .mmbak, seems weird and might require some custom script or tools to open, it is actually a mere sql file. just open it in DB Browser for SQLite, extract to csv or json, done. you can also give it to any AI apps of your choice to let it analyze the file. even claude.ai chat without pro subscription works

so ever since i started a professional job, i always track my money using Money Manager mobile app by Realbyte on my phone. it is easy to use, completely offline, has a nice UI and basic features that i really need, and most importantly free. it has a premium features which i dont know whether it is monthly subs or paid once. i don't care, i don't need it though

but then i started to think of marriage. there'll be two people managing the money together and giving clear visibility to each other. as far as i'm concerned, the data is stored locally in the device. there is no way i setup an account for both me and my wife, login to money manager with that account, and hope the data will be stored there. there's a backup feature though. you register your google account. you can decide whether to backup daily or weekly. the data will be automatically backed up to your google drive. for me, that sucks. every once in a while, i will have to open my wife's drive, download the backup, import it to the app to sync the data between me and her

that's why i built [money tracker](../../../src/contents/project/money-tracker.md). with that i can share an account with my wife, login to the app with that account, log our transaction, stored in that account. two benefits at least:
- we can track our money with our own device. i mean, i use mine, my wife uses hers
- even if the sole money manager for the family is me, my wife can check where our money goes without having to touch my phone

but then there's still a problem. i end up log the data twice. on payday, i log my salary both in the mobile and web app, manually because i still can't get rid of the habit of logging to the mobile app since i can do it offline, but i can't just leave the web app because i want to give transparency to my wife

so i was thinking, maybe i can leverage the backup feature in the mobile app. however, at first i hesitated because the file extension is .mmbak which gave me the impression that this will only work in that app only. however after some research, i found that it's just an sql file. i could open it with DB Browser for SQLite. i even threw it to Claude Desktop with my free account and it could analyze the file just fine.

hence, to stop me from having to track my money twice manually, i had an idea to activate automatic backup in the mobile app and create a cron job in the web app that does this:
- retrieve latest backup from my google drive
- store the timestamp this job runs in upstash redis for future job
- compare the data between the backup and web app (which refers to my userid)
- if a log is marked as deleted in the backup, it'll be deleted from web app
- upsert data from backup which are updated after the aforementioned timestamp to the web app

upon building the web app, i seeded the transaction data tied to my user id using the backup from the mobile app. so it's not really hard to build that job because i don't have to think about complex data migration script