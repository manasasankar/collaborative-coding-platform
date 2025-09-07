
import React from 'react';
import { Toaster } from 'react-hot-toast';
import './App.css';
import { Routes, Route } from "react-router-dom";
import EditorPage from './component/EditorPage';
import Home from './component/Home';

function App() {
  return (
    <>
    <div className="App">
      <div>
        <Toaster  position='top-center'></Toaster>
      </div>
      <Routes>
     <Route path='/' element={ <Home /> } />
      <Route path='/editor/:roomId' element={ <EditorPage /> } />

    </Routes>
    </div>
    </>
  );
}

export default App;
