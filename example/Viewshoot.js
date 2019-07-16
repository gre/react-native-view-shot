/**
 * Sample How To Screenshot Screen inside of ScrollView
 * The original github from 
 * https://github.com/gre/react-native-view-shot
 */
import React, {Component} from 'react';
import {ScrollView, StyleSheet, Text, View, Button, Image, } from 'react-native';

import ViewShot from "react-native-view-shot";

export default class App extends Component {
    constructor(props) {
        super(props)
        this.state={
            error: null,
            res: null,
            options: {
                format: "jpg",
                quality: 0.9
            }
        }
    }

    renderContent()
	{
		const data = [1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20,21,22,23];
		return data.map((item,index) => {
			return (
				<View style={styles.item} key={index}>
					<Text>{item}</Text>
				</View>
			);
		})
	}

    renderResultSnapshot()
    {
        if(this.state.res!==null)
        {
        console.log('Result on return snapshot: ', this.state.res);
        return(
            <Image
                fadeDuration={0}
                resizeMode="contain"
                style={styles.previewImage}
                source={this.state.res}
            />
        );
        }

        return;
    }

    

    renderShootButton(){
        return(
            <Button
                onPress={ async () => await this.captureViewShoot()}
                title="Shoot Me"
                color="#841584"
            />
        )
    }
    
    captureViewShoot()
    {
        this.refs.full.capture().then(uri => {
            console.log("do something with ", uri);
            this.setState({res: {uri: uri}})
        });
    }

    renderViewShot()
    {
        return(
            <ScrollView style={styles.container}>
                <ViewShot 
                    ref="full" 
                    options={{ format: this.state.options.format, quality: this.state.options.quality }} 
                    style={styles.container}
                >
                    {this.renderResultSnapshot()}
                    {this.renderContent()}
                    {this.renderShootButton()}
                </ViewShot>
            </ScrollView>
        )
    }

    render() {
        return this.renderViewShot();
    }
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff'
    },
    content: {
        padding: 10,
        backgroundColor: '#fff'
    },
    item: {
        height: 50,
    },
    previewImage: {
        width: 375,
        height: 300
    },
});
