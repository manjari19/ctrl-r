# ctrl-r
**Ctrl-R** is a web platform that rescues forgotten digital formats and converts them into modern, accessible files

**Deployed App:** [https://ctrl-r.netlify.app/](https://ctrl-r.netlify.app/)

---

## Inspiration
A university archivist finds a 1994 thesis.  
A family uncovers old legal documents after a death.  
The files exist — but they’re locked inside formats like WordPerfect and ODS that modern systems can’t open.  
**This isn’t nostalgia. It’s data loss in slow motion.**  

Organizations don’t lose data because they delete it.
They lose it because software moves on.
Migrating legacy systems is expensive, risky, and often impossible — so **critical documents remain stranded, unusable, and invisible.**

---

## Our Solution
Ctrl-R is a legacy document reviver.  

The users starts by uploading their legacy file. 
They are then given the option to convert the old document into one with a modern-compatible file format.  

We also surface context: what the file type was, when it was created, and information about the older type.  

After pressing convert, the user is able to see a preview of the new file, and download. Additionally, the user receives a short AI powered summary, as well as the ability to ask the chatbot further questions about the document.

---

## How We Built It
Our tech stack is CSS and React for the front end, and Node.js and Express.js for the backend. We deployed on netlify, and the back end is running on render.

---

## Challenges
Some notable challenges we faced were with legacy files themselves, as they were difficult to find and create, which made testing difficult.  

Another challenge was uploading arbitrary files to our backend server. This was something that no one on our team had dealt with before, and it took a lot of help from a mentor, but in the end we succeeded and learned something new.

---

## Future Improvements
Next, Ctrl-R scales in 2 ways:  
- Preservation — Converted files retain original metadata and structural context, ensuring long-term usability, provenance, and historical integrity.  
- Security- futerations of Ctrl-R will prioritize secure handling of converted files, ensuring that sensitive legacy documents remain protected after conversion through robust access controls and storage policies.

---

## How To Run Locally
