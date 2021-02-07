import React, { Component } from "react";
import axios from "axios";
import { Spin } from "antd";
import { feature } from "topojson-client";
import { geoKavrayskiy7 } from "d3-geo-projection";
import { geoGraticule, geoPath } from "d3-geo";
import { select as d3Select } from "d3-selection";
import { schemeCategory10 } from "d3-scale-chromatic";
import * as d3Scale from "d3-scale";
import { timeFormat as d3TimeFormat } from "d3-time-format";

import {
    WORLD_MAP_URL,
    SATELLITE_POSITION_URL,
    SAT_API_KEY
} from "../constants";

const width = 960;
const height = 600;

class WorldMap extends Component {
    constructor() {
        super();
        this.state = {
            isLoading: false,
            isDrawing: false
        };
        this.map = null;
        this.color = d3Scale.scaleOrdinal(schemeCategory10);
        this.refMap = React.createRef();
        this.refTrack = React.createRef();
    }

    componentDidMount() {
        axios
            .get(WORLD_MAP_URL)
            .then(response => {
                // console.log(response);
                const {data} = response;
                const land = feature(data, data.objects.countries).features;
                // console.log(land);
                this.generateMap(land);
            })
            .catch(e => console.log('err in fetch world map data ', e));
    }

    componentDidUpdate(prevProps, prevState, snapshot) {
        if (prevProps.satData !== this.props.satData) {
            // Step 1: get setting and select satlist
            const {
                latitude,
                longitude,
                elevation,
                duration
            } = this.props.observerData;
            const endTime = duration * 60;

            this.setState({
                isLoading: true
            });

            // Step 2: prepare for the url
            const urls = this.props.satData.map(sat => {
                const { satid } = sat;
                const url = `/api/${SATELLITE_POSITION_URL}/${satid}/${latitude}/${longitude}/${elevation}/${endTime}/&apiKey=${SAT_API_KEY}`;

                return axios.get(url);
            });
            console.log('urls -> ', urls);

            Promise.all(urls)
                .then(res => {
                    // console.log(res);
                    const arr = res.map(sat => sat.data);
                    this.setState({
                        isLoading: false,
                        isDrawing: true
                    });
                    // Step 4: track
                    if (!prevState.isDrawing) {
                        // console.log(arr);
                        this.track(arr);
                    } else {
                        const oHint = document.getElementsByClassName("hint")[0];
                        oHint.innerHTML = "Please wait for these satellite animation to finish before selection new ones!";
                    }
                })
                .catch(e => {
                    console.log("err in fetch satellite position -> ", e.message);
                });
        }
    }

    track = data => {
        // console.log(data);
        if (!data[0].hasOwnProperty("positions")) {
            throw new Error("no position data");
            // return;
        }

        // Step 1: total number of position
        const len = data[0].positions.length;

        // Step 2: duration
        const {duration} = this.props.observerData;

        // Step 3: where to draw
        const {context2} = this.map;

        let now = new Date();

        let i = 0;  // 从0开始打点, i 表示 index
        let timer = setInterval(() => {
            let ct = new Date();    // 当前时间

            let timePassed = i === 0 ? 0 : ct - now;
            let time = new Date(now.getTime() + 60 * timePassed);

            context2.clearRect(0, 0, width, height);

            // 时间的文字显示
            context2.font = "bold 14px sans-serif";
            context2.fillStyle = "#333";
            context2.textAlign = "center";
            context2.fillText(d3TimeFormat(time), width / 2, 10);

            if (i >= len) {
                clearInterval(timer);
                this.setState({ isDrawing: false });
                const oHint = document.getElementsByClassName("hint")[0];
                oHint.innerHTML = "";
                return;
            }

            // draw track
            data.forEach(sat => {
                const { info, positions } = sat;
                this.drawSat(info, positions[i]);
            });

            i += 60;
        }, 1000);   // 每秒打一个点
    };

    drawSat = (sat, pos) => {
        const { satlongitude, satlatitude } = pos;

        if (!satlatitude || !satlongitude) return;

        const { satname } = sat;
        const nameWithNumber = satname.match(/\d+/g).join("");

        const { projection, context2 } = this.map;
        const xy = projection([satlongitude, satlatitude]); // 通过经纬度拿到地图坐标

        context2.fillStyle = this.color(nameWithNumber);
        context2.beginPath();
        context2.arc(xy[0], xy[1], 4, 0, 2 * Math.PI);  // 画圆形
        context2.fill();

        // 卫星名 距离轨道的位置
        context2.font = "bold 11px sans-serif";
        context2.textAlign = "center";
        context2.fillText(nameWithNumber, xy[0], xy[1] + 14);
    }

    render() {
        const { isLoading } = this.state;
        return (
            <div className="map-box">
                {isLoading ? (
                    <div className="spinner">
                        <Spin tip="Loading..." size="large" />
                    </div>
                ) : null}
                <canvas className="map" ref={this.refMap} />
                <canvas className="track" ref={this.refTrack} />
                <div className="hint" />
            </div>
        );
    }

    generateMap(land) {
        // Step 1: create projection - map shape
        const projection = geoKavrayskiy7()
            .scale(170)
            .translate([width / 2, height / 2])
            .precision(.1);

        // Step 2: find dom - map position
        // console.log(this.refMap.current);
        const canvas = d3Select(this.refMap.current)    // 通过 ref 拿到 map （React下拿virtual element的方式）
            .attr("width", width)   // 设置 map 属性
            .attr("height", height);
        const canvas2 = d3Select(this.refTrack.current)    // 通过 ref 拿到 map （React下拿virtual element的方式）
            .attr("width", width)   // 设置 map 属性
            .attr("height", height);

        // console.log(canvas);
        let context = canvas.node().getContext("2d");
        // console.log(context);
        let context2 = canvas2.node().getContext("2d");


        // drawing using d3-geo
        let path = geoPath()
            .projection(projection)
            .context(context);

        // 经纬度
        const graticule = geoGraticule();

        // 数据是 land  画笔是 path
        land.forEach(ele => {
            // 画country
            // 定义画笔内容
            context.fillStyle = '#B3DDEF';  // 填充色
            context.strokeStyle = '#000';   // 画笔色
            context.globalAlpha = 0.7;  // 地图清晰度
            // 开始画线
            context.beginPath();
            // 将数据填充进去
            path(ele);
            context.fill();
            context.stroke();

            // 画经纬度
            context.strokeStyle = 'rgba(220, 220, 220, 0.1)';
            context.beginPath();
            path(graticule());
            context.lineWidth = 0.1;
            context.stroke();

            // 画经纬度的上下边界
            context.beginPath();
            context.lineWidth = 0.5;
            path(graticule.outline());
            context.stroke();
        })

        // 拿到地图的reference
        this.map = {
            projection: projection,
            graticule: graticule,
            context: context,
            context2: context2
        };
    }
}

export default WorldMap;