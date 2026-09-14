TLDR: though the extension, .mmbak, seems weird and might require some custom script or tools to open, it is actually a mere sql file. just open it in DB Browser for SQLite, extract to csv or json, done. you can also give it to any AI apps of your choice to let it analyze the file. even claude.ai chat without pro subscription works

so ever since i started a professional job, i always track my transaction using Money Manager mobile app by Realbyte on my phone. i randomly found it in Google Play, installed it, and it was intuitive and suited my need. hence, i stick to it for all these years.

all the transactions data is stored in my device because it is still usable even with no internet connection. i'm fine with that until i have a wife. i think it will be better if we can have a shared account which we can log in to from each of our device and the transaction is linked to that account so that we can collaborate in managing our money. 


so i built this web app [money tracker](../../../src/contents/project/money-tracker.md) for that purpose. while thinking of how to seed the initial data, i remembered that Money Manager has a backup feature which will send the backup file to my Google Drive. i tried that only to find out that the backup file has `.mmbak` extension. i didn't know what that was so i asked Gemini which later said that it was a file extension for Money Manager mobile app by Realbyte which had a special encryption that could only be decrypted in that file. i just believed it. i didn't research further by googling or ask another AI like ChatGPT or Claude. my bad. however, luckily Money Manager has a export to Excel feature. i used it to seed the data for the web app and it worked

now with this app i can share an account with my wife, login to the app with that account, log our transaction, stored in that account. two benefits at least:
- we can track our money with our own device. i mean, i use mine, my wife uses hers
- even if the sole money manager for the family is me, my wife can check where our money goes without having to touch my phone

however, i still couldnt get rid of my habit to log my transaction in the mobile app due to its offline nature and i dont have to login. so to sync the data between mobile and web app, i ended up log my transaction in both places. sucked.

so i researched again about this backup feature we talked about earlier. then i found out that .mmbak is only sql file. i could open it with DB Browser for SQLite. i even threw it to Claude Desktop with my free account and it could analyze the file just fine.

hence, to stop me from having to track my money twice manually, i had an idea to activate automatic backup in the mobile app and create a cron job in the web app that does this:
- retrieve latest backup from my google drive
- store the timestamp this job runs in upstash redis for future job
- compare the data between the backup and web app (which refers to my userid)
- if a log is marked as deleted in the backup, it'll be deleted from web app
- upsert data from backup which are updated after the aforementioned timestamp to the web app

the link to the cron job script here: https://github.com/rayhannr/money-tracker/blob/master/src/lib/sync.ts

so now My workflow stays exactly the same as before. I keep logging in Money Manager like I always have. The only difference is my wife can now see everything from her own device through the web app.