import React, {Component} from 'react';
import { Button } from 'antd';

class SatelliteList extends Component {
    render() {
        return (
            <div className="sat-list-box">
                SatelliteList
                <br/>
                <Button className="sat-list-btn" type="primary">
                        Track on the map
                </Button>
                <div>data</div>
            </div>
        );
    }
}

export default SatelliteList;