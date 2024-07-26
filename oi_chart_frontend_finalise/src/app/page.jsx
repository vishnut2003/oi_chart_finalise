'use client';

import Header from "@/components/Header/Header";
import OiSection from "@/components/OiSection/OiSection";
import serverName from "@/serverName";
import axios from "axios";
import { useEffect, useState } from "react";

export default function Home() {

  const [twoScript, setTwoScript] = useState(false)
  const [loggedIn, setLoggedIn] = useState(false)
  const [expired, setExired] = useState(true)
  const [expireDaysLeft, setExpireDaysLeft] = useState()
  const [errorMessage, setErrorMessage] = useState('')

  useEffect(() => {
    const server = serverName()
    const session = localStorage.getItem('session');
    axios.post(`${server}/users/verify`, {session})
      .then((res) => {
        setLoggedIn(true)
        const userId = res.data._id
        axios.post(`${server}/users/get-expiry-left`, {userId})
          .then((res) => {
            setExired(res.data.expired)
            setExpireDaysLeft(res.data.days)
            setErrorMessage('Your account is expired. contact us for extent access')
          })
          .catch((err) => {
            console.log(err)
          })
      })
      .catch((err) => {
        setErrorMessage('Please login for access')
        setLoggedIn(false)
        console.log(err)
      })
  }, [])

  return (
    <div className="flex flex-col w-full">
      <Header />
      {
        loggedIn && !expired ?
          <div className="p-5">
            <div className="max-w-max py-2 px-4 bg-red-200 text-red-600 font-semibold text-sm rounded-md">
              {expireDaysLeft} days left for expiry!
            </div>
            <div className="md:flex gap-4 p-3 justify-center hidden">
              <button
                className={twoScript ? "py-2 px-4 bg-blue-100 text-blue-600 text-sm font-semibold rounded-md" : 'py-2 px-4 bg-blue-600 text-white text-sm font-semibold rounded-md'}
                onClick={() => {
                  setTwoScript(false)
                }}
              >1 Panel</button>
              <button
                className={twoScript ? 'py-2 px-4 bg-blue-600 text-white text-sm font-semibold rounded-md' : "py-2 px-4 bg-blue-100 text-blue-600 text-sm font-semibold rounded-md"}
                onClick={() => {
                  setTwoScript(true)
                }}
              >2 Panel</button>
            </div>
            {
              twoScript ?
                <div className="flex gap-3 flex-col md:flex-row">
                  <div className="w-full">
                    <OiSection symbolSpecify={'NIFTY'} />
                  </div>
                  <div className="w-full">
                    <OiSection symbolSpecify={'NIFTY'} />
                  </div>
                </div>
                :
                <div className="flex gap-3 flex-col md:flex-row">
                  <div className="w-full">
                    <OiSection oneScript={true} symbolSpecify={'NIFTY'} />
                  </div>
                </div>
            }
          </div>
          :
          <div className="flex justify-center items-center p-4">
            <div className="max-w-max p-6 bg-white rounded-md shadow-md">
              <p>{errorMessage}</p>
            </div>
          </div>
      }

    </div>
  );
}
