import React, { Component, Fragment } from 'react';
import { Button, Form, FormGroup, Input } from 'reactstrap';
import MapGL, { MapContext, Marker } from '@urbica/react-map-gl';

//CSS
import 'bootstrap/dist/css/bootstrap.min.css';
import 'mapbox-gl/dist/mapbox-gl.css';

const accessToken =
	'&access_token=pk.eyJ1IjoiYWtzaGF5Mjc5NiIsImEiOiJjazFjbGY2emwwNGZpM25scDcwMjNzMXhlIn0.-D54L9tbYqRfBSaXWgJbrA';

var viewport = {
	width: '100vw',
	height: '60vh',
	latitude: 18.52043,
	longitude: 73.856743,
	zoom: 12,
};

const markerStyle = {
	padding: '10px',
	color: '#fff',
	cursor: 'pointer',
	background: '#1978c8',
	borderRadius: '6px'
  };
  

var navFullData;

var mapRef;

var from, fromLat, fromLng, fromLatLng;
var to, toLat, toLng, toLatLng;

export default class MapContainer extends Component {
	setFrom = event => {
		var fromText = event.target.value;
		this.from = fromText;
	};

	setTo = event => {
		var toText = event.target.value;
		this.to = toText;
	};

	setFromLocation = async () => {
		const fromText = this.from;
		const url =
			'https://api.mapbox.com/geocoding/v5/mapbox.places/' +
			fromText.replace(' ', '%20') +
			'.json?' +
			accessToken;

		return fetch(url)
			.then(res => res.json())
			.then(result => {
				const lat = result.features[0].geometry.coordinates[0];
				const lng = result.features[0].geometry.coordinates[1];

				this.fromLat = lat;
				this.fromLng = lng;

				this.fromLatLng = lat + ',' + lng;
			});
	};

	setToLocation = async () => {
		const toText = this.to;
		const url =
			'https://api.mapbox.com/geocoding/v5/mapbox.places/' +
			toText.replace(' ', '%20') +
			'.json?' +
			accessToken;

		return fetch(url)
			.then(res => res.json())
			.then(result => {
				const lat = result.features[0].geometry.coordinates[0];
				const lng = result.features[0].geometry.coordinates[1];

				this.toLat = lat;
				this.toLng = lng;

				this.toLatLng = lat + ',' + lng;
			});
	};

	fetchNavData = async query => {
		const fullUrl =
			'https://api.mapbox.com/directions/v5/mapbox/driving/' +
			query +
			'.json?geometries=geojson' +
			accessToken;

		var navData;
		await fetch(fullUrl)
			.then(res => res.json())
			.then(data => {
				navData = data.routes[0].geometry.coordinates;

				var navArray = [];
				navData.map((item, key) => {
					navArray.push('[' + item + ']');
				});

				const jsonUrl =
					'{"type": "Feature","geometry": {"type": "LineString","coordinates": [' +
					navArray +
					']}}';

				navFullData = JSON.parse(jsonUrl);
			})
			.catch(err => {
				console.error(err);
				alert('Unable to find Location!');
			});
	};

	submit = async () => {
		await this.setFromLocation();
		await this.setToLocation();
		const query = this.fromLatLng + ';' + this.toLatLng;
		await this.fetchNavData(query);

		await this.postLocationData(this.from, this.to);

		this.mapRemoveLayer();

		this.mapAddLayer();
	};

	mapRemoveLayer = () => {
		try {
			if (mapRef.getSource('route')) {
				mapRef.removeLayer('route');
				mapRef.removeSource('route');
			}
		} catch (err) {
			console.log(err);
		}
	};

	mapAddLayer = () => {
		if (mapRef.getSource('route')) {
			mapRef.removeLayer('route');
			mapRef.removeSource('route');
		}

		mapRef.addSource('route', {
			type: 'geojson',
			data: navFullData,
		});

		mapRef.addLayer({
			id: 'route',
			source: 'route',
			type: 'line',
			paint: {
				'line-color': '#336666',
				'line-width': 6,
			},
		});

		var bbox = [[this.fromLat, this.fromLng], [this.toLat, this.toLng]];
		mapRef.fitBounds(bbox, {
			padding: { top: 100, bottom: 100, left: 100, right: 100 },
		});
	};

	postLocationData = async (from, to) => {
		const data = {
			from_location: from,
			to_location: to,
		};
		fetch('/api/map-data/', {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
			},
			body: JSON.stringify(data),
		})
			.then(res => console.log(res))
			.catch(error => console.error(error));
	};

	render() {
		return (
			<div className='d-flex flex-column align-items-center'>
				<div className='text-center mt-4 mb-4'>
					<Form>
						<FormGroup>
							<Input
								type='text'
								name='from_location'
								id='fromInput'
								placeholder='Enter Starting Point'
								onChange={this.setFrom}
							/>
						</FormGroup>
						<FormGroup>
							<Input
								type='text'
								name='to_location'
								id='toInput'
								placeholder='Enter Destination Point'
								onChange={this.setTo}
							/>
						</FormGroup>
						<div>
							<Button
								color='primary'
								className="mr-3"
								onClick={this.submit}
							>
								Submit
							</Button>
							<Button
								color='primary'
								onClick={this.mapRemoveLayer}
							>
								Clear
							</Button>
						</div>
					</Form>
				</div>
				<MapGL
					{...viewport}
					style={{width: '98vw', height: '78vh'}}
					// mapStyle='mapbox://styles/mapbox/light-v9'
					mapStyle='mapbox://styles/mapbox/streets-v11'
					accessToken={
						'pk.eyJ1IjoiYWtzaGF5Mjc5NiIsImEiOiJjazFjbGphcGcwbTQyM2Rtd2oxZW9tYWRuIn0.0UVb63pN3wW_LIsQWpECIw'
					}
					onViewportChange={viewport => {
						this.viewport = viewport;
					}}
				>
					<MapContext.Consumer>
						{map => {
							mapRef = map;
						}}
					</MapContext.Consumer>
				</MapGL>
			</div>
		);
	}
}
