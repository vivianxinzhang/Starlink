import React, {Component} from 'react';
import axios from 'axios';
import SatSetting from './SatSetting';
import SatelliteList from './SatelliteList';
import WorldMap from "./WorldMap";
import {NEARBY_SATELLITE, SAT_API_KEY, STARLINK_CATEGORY} from "../constants";

class Main extends Component {
    constructor(){
        super();
        this.state = {
            satInfo: null,
            satList: null,
            setting: null,
            isLoadingList: false
        };
    }

    render() {
        const { satInfo, isLoadingList, satList, setting } = this.state;
        console.log(this.state);
        return (
            <div className="main">
                <div className="left-side">
                    <SatSetting onShow={this.showNearbySatellite}/>
                    <SatelliteList satInfo={satInfo}
                                   isLoad={isLoadingList}
                                   onShowMap={this.showMap}
                    />
                </div>
                <div className="right-side">
                    <WorldMap satData={satList} observerData={setting} />
                </div>
            </div>
        );
    }

    showMap = (selected) => {
        this.setState(preState => ({
            ...preState,
            satList: [...selected]
        }))
    }

    // fetch data from backend server
    showNearbySatellite = (setting) => {
        console.log(setting);
        // Step 1: get the setting
        this.setState({
            isLoadingList: true,
            setting: setting
        })
        this.fetchSatellite(setting);
    }

    // 70, -40, 90, 90, 10
    // 70, -70, 90, 90, 10
    fetchSatellite = (setting) => {
        // Step 2: configure
        const { latitude, longitude, elevation, altitude } = setting;
        const url = `/api/${NEARBY_SATELLITE}/${latitude}/${longitude}/${elevation}/${altitude}/${STARLINK_CATEGORY}/&apiKey=${SAT_API_KEY}`;

        // Step 3: send req
        // - shown spin and send request
        this.setState({
            isLoadingList: true
        });
        axios.get(url)
            .then(response => {
                console.log('response -> ', response);
                console.log('response.data ->', response.data);
                console.log(this.state);
                // when fetching data succeed, hide spin and update satInfo
                this.setState({
                    satInfo: response.data,
                    isLoadingList: false
                });
                console.log(this.state);
            })
            .catch(error => {
                console.log('err in fetch satellite -> ', error);
                // when fetching data failed, hide spin
                this.setState({
                    isLoadingList: false
                });
            })
    }
}

export default Main;
