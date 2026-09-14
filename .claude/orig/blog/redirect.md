one of my favorite thing to do at work when i've completed my main task before taking another one is trying to improve the performance of a React app i am entrusted to. so this is a multi tenant app where multiple customers are in the same environment sharing the same infrastructure. they just don't share the same subdomain.

what i mean is, lets say the app's domain is example.com, so the customers log in to that domain. once they are logged in, they are redirected to a subdomain that represents their customer id created during registration.

the id is not uuid though, so the subdomain is not that weird. upon registration, they fill their name, be it company or personal, then the id will be inferred from that name. if they fill "Fantastic Baby", their id will be "fantasticbaby". hence, they will be redirected to fantasticbaby.example.com after logging in.

the entry file of the app more or less look like this

```js
import {createRoot} from 'react-dom/client'

createRoot(document.getElementById('root'), 
  <SomeProvider>
    <AnotherProvider>
      <MainLayout>
        <ErrorBoundary>
          <Routes>
            {/* some routes that doesnt need session */}
            <SessionManager>
              {/* some routes that need a valid session */}
            </SessionManager>
          </Routes>
        </ErrorBoundary>
      </MainLayout>
    </AnotherProvider>
  </SomeProvider>
)
```

inside `SessionManager`, we do some checking before rendering the main content:
- fetch current user data containing their customer id
- if no subdomain detected, redirect to the subdomain
- if a subdomain is detected:
  - fetch is error with `subdomain mismatch` message, redirect back to no subdomain because it can't really fetch the actual user's customer id to redirect to. hence, go back to step 1
  - fetch is not error and subdomain matches, render the app content. no more redirection

the problem:
- the initial js file user should download is more than 1MB which contain the main logic and dependencies that has to load upfront. well yeah this is an issue in itself which we can improve later
- that file has to be downloaded every time in each redirection. we actually have a cache mechanism which i've explained in [my other blog](../../../src/contents/blog/nginx-cache-control-react-performance.md), but it is not shared across subdomain
- when user login, it starts with no subdomain. therefore, they need to actually download the same js file twice upon login. the subdomain mismatch is even worse. user needs to download it three times because they are redirected twice as explained earlier.

so i thought maybe moving the redirection logic out of `SessionManager`, then only load that big initial js file when there's no need to redirect.

now the logic look like this
```js
// entry file

const didRedirect = resolveRedirection()
if(!didRedirect) {
  const {mountApp} = await import('./mountApp')
  mountApp()
}

// mountApp.ts
createRoot(/* same as earlier */)
```

if you don't know, that await import syntax is called dynamic import. it allows us to defer the file import on demand, in a certain condition. if i just use normal import syntax at the top of the file, the file containing huge core logic + dependencies is still loaded upfront, negating the purpose of moving the redirection logic out of `SessionManager`

well the result may not be significant in fast connection especially in developed countries. 1MB is relatively small and can be downloaded within a second. however in slow 4G or even worse which is not that rare in "third world countries", it matters a lot. it used to take more than 10 seconds, but with my solution, it only takes 3-5 seconds to finally redirect user to the correct subdomain and load the app. this improvement can be even more important if my company is seriously targeting customers from around the world, not exclusive to countries with mature internet infrastructure.