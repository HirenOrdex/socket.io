﻿### Steps to Integrate Socket.io for Real-Time Updates in Express and React Applications

Below are the steps required to integrate Socket.io in your Express server and React client for real-time updates when updating tyre data. The goal is to ensure that when a tyre is updated via a PATCH API request, the latest data is fetched and displayed on the client side without needing to refresh the page manually.

---

### Step 1: Setting Up the Express Server with Socket.io

**1.1. Install Dependencies**

Install the necessary packages for Socket.io:

```bash
npm install socket.io cors
```

**1.2. Update Server Code**

Update your server setup to include Socket.io and handle CORS properly:

```javascript
// server.js
const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const cors = require('cors');
const bodyParser = require('body-parser');
const { exchangeTyre } = require('./path_to_your_controller'); // Adjust the path accordingly
const { Router } = require("express");

const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
    cors: {
        origin: "http://localhost:3000",
        methods: ["GET", "POST", "PATCH"],
        credentials: true // Allow credentials
    }
});

app.use(cors({
    origin: "http://localhost:3000",
    credentials: true
}));
app.use(bodyParser.json());

app.use("/api", require('./path_to_your_router')); // Adjust the path accordingly

// Handle Socket.io connections
io.on('connection', (socket) => {
    console.log('New client connected');
    socket.on('disconnect', () => {
        console.log('Client disconnected');
    });
});

const PORT = process.env.PORT || 4000;
server.listen(PORT, () => console.log(`Server running on port ${PORT}`));

module.exports = { io }; // Export io for usage in controller
```

**1.3. Update Controller**

Update the controller to emit events via Socket.io when data is updated:

```javascript
// installedTyre.controller.js
const { io } = require('../../server'); // Adjust the path accordingly

export const exchangeTyre = async (req, res, next) => {
    // ...existing code...

    if (updateInstallation) {
        // Emit updated data to all connected clients
        io.emit('refreshData', await TyreInstall.findAll()); // Fetch and emit all tyre data
        return res.status(200).json({ success: true, data: createNewTyreInstall, msg: "Installation data Updated Successfully" });
    }
    
    // ...existing code...
};
```

**1.4. Router Setup**

Ensure your router is set up correctly:

```javascript
// installedTyre.router.js
const { Router } = require("express");
const { getVehicleTyres, getAllInActiveTyres, getVehicleData, addTyre, exchangeTyre, getVehicleTyresSearch, vehicleSearch, getVechicleTyrePOS, getVechicleTyreEXPOS, exchangeFetchVechicle } = require("../../../controllers/tyre/admin/installedTyre.controller");
const { checkAddTyreValidations, checkExchangeTyreValidations } = require("../../../validators/tyre/admin/installedTyreValidators");

const router = Router();

router.get("/admin/installed-vehicle-tyres/:id", getVehicleTyres);
router.get("/admin/installed-vehicle-tyres-search/:id", getVehicleTyresSearch);
router.get("/admin/installed-vehicle-search", vehicleSearch);
router.get("/admin/all-vehicles", getVehicleData);
router.get("/admin/inactive-tyres", getAllInActiveTyres);
router.post("/admin/add-tyres", checkAddTyreValidations, addTyre);
router.patch("/admin/exchange-tyres/:id", checkExchangeTyreValidations, exchangeTyre);
router.get('/admin/installed-vehicle-tyres-pos/:id', getVechicleTyrePOS);
router.get('/admin/installed-vehicle-tyres-expos/:id', getVechicleTyreEXPOS);
router.get('/admin/installed-vehicle-tyres-getallvehicle/:id', exchangeFetchVechicle);

module.exports = router;
```

---

### Step 2: Setting Up the React Client

**2.1. Install Socket.io Client**

Install the Socket.io client library:

```bash
npm install socket.io-client
```

**2.2. Update Client Code**

Update your React component to connect to the Socket.io server and handle real-time updates:

```javascript
// src/App.js
import React, { useEffect, useState } from 'react';
import { io } from 'socket.io-client';
import './App.css';

const ENDPOINT = 'http://localhost:4000';

const App = () => {
    const [data, setData] = useState([]);

    useEffect(() => {
        const socket = io(ENDPOINT, {
            withCredentials: true
        });

        socket.on('refreshData', (updatedData) => {
            setData(updatedData);
        });

        // Initial data fetch
        fetch(`${ENDPOINT}/api/data`, {
            credentials: 'include'
        })
            .then(response => response.json())
            .then(newData => setData(newData));

        // Cleanup on component unmount
        return () => socket.disconnect();
    }, []);

    const addItem = (name) => {
        fetch(`${ENDPOINT}/api/add`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ name }),
            credentials: 'include'
        }).then(() => {
            // No need to fetch new data manually, socket.io will handle it
        });
    };

    const updateItem = (id, name) => {
        fetch(`${ENDPOINT}/api/update`, {
            method: 'PATCH',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ id, name }),
            credentials: 'include'
        }).then(() => {
            // No need to fetch new data manually, socket.io will handle it
        });
    };

    const handleAddClick = () => {
        const name = prompt('Enter new item name:');
        if (name) {
            addItem(name);
        }
    };

    const handleUpdateClick = (id) => {
        const name = prompt('Enter new name:');
        if (name) {
            updateItem(id, name);
        }
    };

    return (
        <div className="App">
            <header className="App-header">
                <h1>Data List</h1>
                {data.map(item => (
                    <div key={item.id}>
                        {item.name}
                        <button onClick={() => handleUpdateClick(item.id)}>Update</button>
                    </div>
                ))}
                <button onClick={handleAddClick}>Add New Item</button>
            </header>
        </div>
    );
};

export default App;
```

**2.3. Handle CORS Issue**

Ensure that your Express server is properly configured to handle CORS, particularly with credentials:

```javascript
// server.js
const cors = require('cors');

// Inside your Express app configuration
app.use(cors({
    origin: "http://localhost:3000",
    credentials: true
}));
```

---

### Summary

By following these steps, you ensure that your application can handle real-time updates via Socket.io when data is updated through a PATCH API request. The client will receive the latest data and update the UI without needing to refresh the page manually.


##  download the zip file and run the project [socket.io.rar](https://github.com/HirenOrdex/socket.io/blob/main/socket.io.rar)


# [perview](https://photos.app.goo.gl/UU5wpqgywbHiuypVA)
