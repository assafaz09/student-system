import React from 'react'


export default function ThxPage() {
  return (
    <div className='thx-page'>
        <h1 style={{color:"black"}}>דברו איתנו</h1>
        <h2 style={{color:"black"}}>יש לכם רעיון לשיפור,עצה או סתם להגיד שלום?</h2>
<p style={{color:"black"}}>נשמח לשמוע מכם!</p>
    <form action={"register"} method="post">
        <label htmlFor="name">שם:</label>
        <input type="text" id="name" name="name" />
        <label htmlFor="email">אימייל:</label>
        <input type="email" id="email" name="email" />
        <label htmlFor="message">הודעה:</label>
        <textarea id="message" name="message"></textarea>
        <button style={{ width: '80px', backgroundColor: '#ff9100', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer', padding: '10px', transition: 'background-color 0.8s, transform 0.4s' }} type="submit">שלח</button>
    </form>

    </div>
  )
}
