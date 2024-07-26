import serverName from '@/serverName'
import axios from 'axios'
import React, { useEffect, useState } from 'react'

const Contact = () => {

  const server = serverName()

  const [contactInfoFields, setContactInfoFields] = useState({
    phone: '',
    email: '',
    note: ''
  })
  const [successMessage, setSuccessMessage] = useState('')

  useEffect(() => {
    const server = serverName()
    axios.get(`${server}/settings/contacts/get`)
      .then((res) => {
        setContactInfoFields(res.data[0])
      })
      .catch((err) => {
        console.log(err)
      })
  }, [])

  const submitContactInfo = (e) => {
    e.preventDefault()
    axios.post(`${server}/settings/contacts/edit`, contactInfoFields)
      .then((res) => {
        setSuccessMessage('Contact info saved!')
      })
  }

  return (
    <div className='w-80'>
        <form 
        onSubmit={submitContactInfo}
        className='flex flex-col gap-2 w-full items-start'>
            <input 
            className='px-4 py-2 rounded-md w-full'
            type="text" 
            name="phone" 
            value={contactInfoFields.phone}
            onChange={(e) => {
              setContactInfoFields({
                ...contactInfoFields,
                phone: e.target.value
              })
            }}
            placeholder='Phone Number'/>

            <input 
            className='px-4 py-2 rounded-md w-full'
            type="email" 
            name="email" 
            value={contactInfoFields.email}
            onChange={(e) => {
              setContactInfoFields({
                ...contactInfoFields,
                email: e.target.value
              })
            }}
            placeholder='Email Address'/>

            <textarea 
            name="notes" 
            rows="3" 
            placeholder='Notes' 
            value={contactInfoFields.note}
            onChange={(e) => {
              setContactInfoFields({
                ...contactInfoFields,
                note: e.target.value
              })
            }}
            className='px-4 py-2 rounded-md w-full'></textarea>

            <button
            type='submit'
            className='py-1 px-4 bg-blue-600 text-white rounded-md'
            >Save</button>
            {
              successMessage &&
              <div className='py-2 px-5 rounded-md shadow-sm w-full bg-green-100 text-green-500'>
              <p>{successMessage}</p>
            </div>
            }
        </form>
    </div>
  )
}

export default Contact