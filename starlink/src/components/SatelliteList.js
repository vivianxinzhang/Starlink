import React, {Component} from 'react';
import { List, Avatar, Button, Checkbox, Spin } from 'antd';
import satelliteIcon from "../assets/images/logo.svg";
import {select} from "d3-selection";

class SatelliteList extends Component {
    constructor(){
        super();
        this.state = {
            selected: [],
            isLoad: false
        };
    }

    onChange = e => {
        console.log('clicked -> ', e.target);
        const { dataInfo, checked } = e.target;
        // processing the satellite
        const { selected } = this.state;
        // add or remove selected satellite to/from the satList
        const list = this.addOrRemove(dataInfo, checked, selected);
        this.setState({ selected: list })
    }

    addOrRemove = (sat, status, list) => {
        const found = list.some( entry => entry.satid === sat.satid);
        // case1: check is true
        // -> sat not in list -> add item
        // -> sat is in list -> do nothing

        // case2: check is false
        // -> sat not in list -> do nothing
        // -> sat is in list -> remove it

        if(status && !found){
            // list.push(item)
            list = [...list, sat]
        }

        if(!status && found){
            list = list.filter( entry => {
                return entry.satid !== sat.satid;
            });
        }
        console.log(list);
        return list;
    }

    render() {
        console.log(this.props);
        const satList = this.props.satInfo ? this.props.satInfo.above : [];
        const { isLoad } = this.props;
        const { selected } = this.state;
        return (
            <div className="sat-list-box">
                <br/>
                <Button
                    className="sat-list-btn"
                    type="primary"
                    // disabled={ selected.length === 0 }
                >
                        Track on the map
                </Button>
                <hr/>
                {
                    isLoad ?
                        <div className="spin-box">
                            <Spin tip="Loading..." size="large" />
                        </div>
                        :
                        <List
                            className="sat-list"
                            itemLayout="horizontal"
                            size="small"
                            dataSource={satList}
                            renderItem={item => (
                                <List.Item
                                    actions={[<Checkbox dataInfo={item} onChange={this.onChange}/>]}
                                >
                                    <List.Item.Meta
                                        avatar={<Avatar size={50} src={satelliteIcon} />}
                                        title={<p>{item.satname}</p>}
                                        description={`Launch Date: ${item.launchDate}`}
                                    />
                                </List.Item>
                            )}
//                             renderItem={item => {
//                                   //console.log(item);
//                                   return (
//                                         <List.Item>
//                                               haha
//                                         </List.Item>
//                                   )
//                             }}
                        />
                }
            </div>
        );
    }
}

export default SatelliteList;