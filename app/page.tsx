"use client"
import { Button, Col, Label } from 'reactstrap'
import Styles from './page.module.css'
import { Input } from '@mui/material'
import { useEffect, useState } from 'react'

interface MailData {
  serial: string;
  name: string;
  subject: string;
  body: string;
  _id?: string
}


export default function Home() {
  // const [data, setData] = useState<MailData[]>([]);
  const [searchResults, setSearchResults] = useState<MailData[]>([]);
  const [editingData, setEditingData] = useState<MailData | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [onemaildata, setOnemaildata] = useState<MailData >();
  const [forrefresh, setForrefresh] = useState(false);

  const clearformdata = () => {
    (document.getElementById('nameInput') as HTMLInputElement).value = '';
    (document.getElementById('subjectInput') as HTMLInputElement).value = '';
    (document.getElementById('bodyInput') as HTMLInputElement).value = '';
  }

  const handleEdit = async (dataForEdit: MailData) => {
    setEditingData(dataForEdit)
    setIsEditing(true);
  }

  const handleUpdate = async (payload: MailData) => {
    try {

      console.log("dataToUpdate", payload)
      const url = `http://localhost:4000/mail/updateMail/${editingData?._id}`;
      const resonseEdit = await fetch(url, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      })
      const res = await resonseEdit.json()
      if (resonseEdit.ok) {
        console.log("res", res.updatedEntry)
        console.log("mail Updated!!!");
        setIsEditing(false);
        // setEditingData(null);

        const updatedIndex = searchResults.findIndex((item) => item._id === editingData?._id);
        if (updatedIndex !== -1) {
          // Create a new array with the updated item
          const newDataArray = [...searchResults];
          newDataArray[updatedIndex] = { ...payload, _id: editingData?._id };
          // cancelEditUsers();
          // setuserData(newDataArray);
          // setIsLoading(false);
          setSearchResults(newDataArray);
        }
      }
      setIsEditing(false);
      clearformdata();
    } catch (error) {
      console.error('Error', error);
    }
  }


  const handleDelete = async (serial: string) => {
    console.log("serial", serial)
    try {
      const url = `http://localhost:4000/mail/deletemail/${serial}`;
      console.log(url);
      const responseDele = await fetch(url, {
        method: "DELETE",
      })
      if (responseDele) {
        // alert({ message: `Mail Deleted`, responseDele });
        console.log("mail Deleted!!");

        setSearchResults((prevResults) => prevResults.filter(item => item._id !== serial));
      }
    } catch (error) {
      console.error('Error', error);
    }
  }

  const handleSend = async () => {
    try {
      let url = "http://localhost:4000/mail/createmail";

      const name = (document.getElementById('nameInput') as HTMLInputElement).value;
      const subject = (document.getElementById('subjectInput') as HTMLInputElement).value;
      const body = (document.getElementById('bodyInput') as HTMLInputElement).value;

      const dataToSend = {
        name,
        subject,
        body,
      };
      console.log(dataToSend);

      const response = await fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(dataToSend),
      });

      if (!response.ok) {
        throw new Error(`HTTP error ! Status: ${response.status}`);
      }

      const responseData = await response.json();
      if (responseData) {

        console.log("responseData",)

        // alert(`Mail sent: ${JSON.stringify(responseData)}}`);
      }

      // ________________________________________________________Ask Shivaji Bhaiiya_______________________________________
      setSearchResults((prevResults) => [...prevResults, responseData.newForm]);
      // handleSearch();
      console.log("mail sent!!");
    } catch (error) {
      console.error('Error', error);
    }
  }

  const handleSearch = async () => {
    try {
      let url = "http://localhost:4000/mail/getallmails";
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }
      const data1 = await response.json();
      setSearchResults(data1.mails);
      console.log(data1); // You can safely log it here
    } catch (error) {
      console.error('Error', error);
    }
  };

  const handleformSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    // console.log("eform submit", e)
    const data = new FormData(e.currentTarget);

    const payload = {
      name: data.get('name'),
      subject: data.get('subject'),
      body: data.get('body'),
    }
    // console.log("payload", payload)

    handleUpdate(payload as MailData);
  }


  useEffect(() => {
    handleSearch();
    console.log(searchResults)
  }, [])

  useEffect(() => {
    if (onemaildata) {
      setForrefresh(true);
    }
  }, [onemaildata]);

  const handleOneSearch = async () => {
    const searchInput = (document.getElementById('searchInput') as HTMLInputElement).value;

    if (!searchInput) {
      alert("the input should not be empty!!");
      return;
    }
    try {
      let url = `http://localhost:4000/mail/getonemail?name=${searchInput}`;
      const response = await fetch(url);

      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }
      const data1 = await response.json();
      setOnemaildata(data1.mail);
      setForrefresh(true); 
      console.log("data1",data1);
      console.log("onemail",onemaildata);
    } catch (error) {
      console.error('Error', error);
    }
  }

  return (
    <div className={Styles.defaultpagecontainer}>
      {/* ____________________________Create__________________________________ */}
      <div className={Styles.maintabcontainer}>
        <div className={Styles.header}>
          <span>Create a Mail</span>
        </div>
        <form className={Styles.form} style={{ padding: "20px", gap: "30px" }} onSubmit={handleformSubmit}>
          <br></br>
          <Col md={12}>

            <Label>Recipant <span className={Styles.mandatory}>*</span> </Label> <br />
            <Input name='name' type='text' placeholder='Enter Name' id='nameInput' defaultValue={editingData ? editingData.name : ''} />
          </Col>
          <br></br>
          <Col md={12}>
            <Label>Subject <span className={Styles.mandatory}>*</span></Label> <br />
            <Input name="subject" type='text' placeholder='Enter Subject' id='subjectInput' defaultValue={editingData ? editingData.subject : ''} />
          </Col>
          <br></br>
          <Col md={12}>
            <Label>Body<span className={Styles.mandatory}>*</span> </Label> <br />
            <Input name='body' type='text' placeholder='Enter Email' id='bodyInput' defaultValue={editingData ? editingData.body : ''} />
          </Col>
          <br></br>
          <Col md={12} style={{ display: "flex", alignContent: "space-around", justifyContent: "center" }}>
            {isEditing ? (
              <Button className='dark-btn' type='submit'>
                Update
              </Button>
            ) : (
              <Button className='dark-btn' onClick={handleSend}>
                Send
              </Button>
            )}
          </Col>
        </form>
      </div>
      {/* ____________________________Read__________________________________ */}
      <div className={Styles.maintabcontainer}>
        <div className={Styles.header}>
          <span>Search in Inbox</span>
        </div>
        <div>
          <br></br>
          <Col md={12}>
            <Label>Person</Label>
            <br></br>
            <Input
              type="text"
              placeholder="Search..."
              style={{ border: "1px solid lightgray", marginTop: "20px",background:"none" }} id='searchInput'
            />
          </Col>
          <br></br>
          <Col md={12} style={{ display: "flex", alignContent: "space-around", justifyContent: "center" }} >
            <Button className='dark-btn' onClick={() => handleOneSearch()}>
              Search
            </Button>
          </Col>
          <br></br>
          <Col md={24} >
           {forrefresh ? (
              <table className={Styles.gridTable}>
                <thead>
                  <tr>
                    <th>Recipient</th>
                    <th>Subject</th>
                    <th>Body</th>
                  </tr>
                </thead>
                <tbody>
                    <tr key={onemaildata._id}>
                      <td>{onemaildata.name}</td>
                      <td>{onemaildata.subject}</td>
                      <td>{onemaildata.body}</td>
                    </tr>
                </tbody>
              </table>
            ) : (
              <p>No results found.</p>
            )}
          </Col>
        </div>
      </div>
      {/* ________________________________________Table Data_______________________________________________ */}
      <div className={Styles.maintabcontainer} >
        <div className={Styles.header}>
          <span>Inbox</span><br></br><br></br>
          <Button className='dark-btn' onClick={() => handleSearch()}>
            Refresh
          </Button>
        </div>
        <div >
          <br></br>
          <Col md={24}>
            {searchResults.length > 0 ? (
              <table className={Styles.gridTable}>
                <thead>
                  <tr>
                    <th>Recipient</th>
                    <th>Subject</th>
                    <th>Body</th>
                    <th></th>
                    <th></th>
                  </tr>
                </thead>
                <tbody>
                  {searchResults.map((item) => {

                    return (
                      <tr key={item._id} >
                        <td>{item.name}</td>
                        <td>{item.subject}</td>
                        <td>{item.body}</td>
                        <td><Button onClick={() => handleDelete(item?._id!)}>Delete</Button></td>
                        <td><Button onClick={() => handleEdit(item)}>Edit</Button></td>
                      </tr>
                    )
                  }


                  )}
                </tbody>
              </table>
            ) : (
              <p>No results found.</p>
            )}
          </Col>
          <br></br>
        </div>
      </div>
      {/* ____________________________Update__________________________________ */}
      {/* ____________________________Delete__________________________________ */}
    </div>
  )
}
