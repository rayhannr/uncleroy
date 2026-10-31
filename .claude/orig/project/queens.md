i started playing linkedin puzzle games earlier this year after constantly getting notifications about my mutuals scored on those games. i didn't really care at first. then one day i opened the notif and played the game. so ok, linkedin has multiple daily puzzle games. that's cool. i like puzzle games. however, there were two games that i wasn't familiar with and it took me long to finish them with hints. they're queens and tango.

i kept playing them every day until i understood the pattern. when i understood the pattern, i found fun. when i had fun, i wanted to play more. this happened only with queens though. i didn't really have the same vibe with tango

but the problem is that you only could play one game in one day. you want more? you wait for tomorrow. so i googled queens and found [this](https://queensgame.vercel.app/community-levels). it is an open source queens game where anyone can contribute in making the levels.

i played it, i enjoyed it. there are hundreds of levels, but i have finished all of them. new level didn't come out every day. so instead of waiting, i decided to build my own. i made a function that could generate a level with random number of dimensions from 5-18. i setup a cron job that runs daily to run that function so there will always be a new level every day. if i've played all the levels, i could just ran the function manually to generate dozens of levels then deploy it

at first, i could only play the game in one device. well i could technically play in any device, but the progress doesn't sync. i play 100 levels on my phone, but that progress doesn't carry over when i want to play it in my laptop

the solution to that is pretty simple when i can use AccelByte Gaming Services though. i leveraged its login with device and google and cloud save features.

the way it works is as follows (you can explain in paragraph instead of bullet points in the real document later):
- user opens the game. the browser check whether device id exists in local storage. if not, it will create one then automatically login with that id
- if a user with that device id doesnt exist yet, AGS will create an account linked to that id. otherwise, it will be just a regular login
- when user finishes a level, the result is saved using cloud save as a player record. the record is an array of object representing the level and the time it takes to finish it
- as i said, the device id is stored in local storage. so if they clears the browser data, the game data still persist in AGS but there is no way for them to retrieve or reuse it unless they know the exact device id. other than that, the data is not shared across device
- that's when the login with google can help. when user decides to login with google, their device account is linked to that google account. now they can play in any device and get their progress synced as long as they login with one google account
- if the google account has been used in another device and already has some progress, the progress will be merged with the current device

note to the audit and writer agent:
- you can check queens sibling directory and accelbyte ai plugin for the details and docs