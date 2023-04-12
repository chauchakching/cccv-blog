---
title: Why brwoser redirect to different domain with text "/\abc.com"?
date: "2023-04-12"
---

If I run this script

```ts
// originally on https://example.com
window.location.href = "/\\abc.com"
```

, where would the browser take me to? `example.com/\abc.com`? or `abc.com`?
When I first bumped into this question, I thought I know how the browser's behavior pretty well.

# Analysis

The string `"/\\abc.com"` in js has an extra backslash to escape the backslash to represent text `/\abc.com`.
As the string starts with a single forward slash `/`, it should be a relative path, right? But no.
When I run `window.location.href = "/\\abc.com"`, browser takes me to `abc.com`.
Which means it is indeed an absolute path. Why??

Here are the most common cases of browser redirect (potentially relative) url for redirect:

- `https://google.com`: includes protocol/scheme `https`, so it's an absolute path
- `//abc.com`: not that common, but [it's an absolute path](https://stackoverflow.com/questions/6785442/browser-support-for-urls-beginning-with-double-slash) and stated in in RFC 1808
- `/home`: the usual relative path
- `apple`: a relative path, and the redirect will replace the last part of pathname with `apple` e.g. `example.com/a/b/c` -> `example.com/a/b/apple`
- `home.html`: a relative path, similar to `apple`
- `/home.html`: a relative path, similar to `home.html`

None of the cases have anything to do with the backslash `\`.

# MDN?

Didn't mention anything special about backslash.

# Google?

Couldn't really find anything related to url redirect with backslash.

# Would ChatGPT (GPT-4) know the answer?

Let's give it a try.

![ask-chatgpt-1](./ask-chatgpt-1.png)

Nahhh, wrong. ChatGPT thought `/\abc.com` was a relative path too.

![ask-chatgpt-2](./ask-chatgpt-2.png)

Even given with feedback to correct the answer, ChatGPT couldn't tell why.

# More background

Actually my ultimate goal was to create a function that determines if a string would
cause domain change in browser redirect. Long story short, with the help of ChatGPT,
I have the following function:

```ts
function willDomainChangeWhenRedirect(url: string) {
  // Create a link element to easily parse the input URL
  const link = document.createElement("a")
  link.href = url

  // Get the hostname of the input URL and the current window
  const newHostname = link.hostname
  const currentHostname = window.location.hostname

  // Compare the hostnames and return true if they are different
  return newHostname !== currentHostname
}
```

At the end, I had no way to implement the logic, and had to rely on browser's implementation
to parse the url string and get the hostname. I wonder: what is the url
construction logic in the browser engine?

# Checking chromium source code

I was left with one final way: check the source code of chromium. But the project is huge.
It would take me lots of time! What if, we ask ChatGPT for guidance?

Let's start from asking for entry point of reading the source code.

![ask-chatgpt-chromium-1](./ask-chatgpt-chromium-1.png)

That's a good start! I've heard of blink as the rendering engine of chromium.
