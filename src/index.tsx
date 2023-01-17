import React from "react";
import ReactDOM from "react-dom";
import { App } from "./App";
import { Theme } from "@twilio-paste/theme";

import './sass/styles.scss';

const container = document.getElementById('app');
ReactDOM.render(
    <Theme.Provider>
        <App />
    </Theme.Provider>,
    container);