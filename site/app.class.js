'use strict'

// Dependencies
let express   = require( 'express' ),
	helmet    = require( 'helmet' ),
	http      = require( 'http' ),
	socket_io = require( 'socket.io' ),
	colors    = require( 'colors' ),
	ip        = require( 'ip' ),
	util      = require( 'util' ),
	Projects  = require( './models/projects.class.js' )

/**
 * App class
 */
class App
{
	/**
	 * Constructor
	 */
	constructor( _options )
	{
		this.set_options( _options )
		this.set_models()
		this.set_express()
		this.set_server()
		this.set_socket()
	}

	/**
	 * Set models
	 */
	set_models()
	{
		// Set up
		this.projects = new Projects()

		// // Tests
		// var project = this.projects.create_project( 'test' )
		// project.create_folder( 'toto' )
		// project.get_folder( 'toto//tutu/tete', true )
		// project.create_file( 'coucou/coco.txt', 'content 0' )
		// project.update_file( 'toto/tutu/tete/tutu.txt', 'content 1' )
		// project.update_file( 'toto/tata/lorem.txt', 'content 2' )
		// project.update_file( 'toto/tata/ipsum.txt', 'content 3' )
		// project.delete_folder( 'toto/tutu', true )
		// project.delete_file( 'toto/tata/ipsum.txt' )
		// console.log( util.inspect( project, { depth: null, colors: true } ) )
	}

	/**
	 * Set options
	 */
	set_options( _options )
	{
		// No option
		if( typeof _options !== 'object' )
			_options = {}

		if( typeof _options.port === 'undefined' )
			_options.port = 3000

		// Save
		this.options = _options
	}

	/**
	 * Set express
	 * Start express and set controllers
	 */
	set_express()
	{
		// Set up
		this.express = express()
		this.express.use( helmet() )

		// Controllers
		this.express.use( '/codes', require( './controllers/index.js' ) )
	}

	/**
	 * Set server
	 */
	set_server()
	{
		// Set up
		this.server = http.createServer( this.express )

		// Start
		this.server.listen( this.options.port, () =>
		{
		    // URL
		    let url = 'http://' + ip.address() + ':' + this.options.port

		    console.log( colors.green( '---------------------------' ) )
		    console.log( 'server'.green.bold + ' - ' + 'started'.cyan )
		    console.log( 'server'.green.bold + ' - ' + url.cyan )
		} )
	}

	/**
	 * Set socket
	 */
	set_socket()
	{
		// Set up
		this.io = socket_io.listen( this.server )

		// Connection event
		this.io.on( 'connection', ( socket ) =>
		{
		    console.log( 'socket'.green.bold + ' - ' + 'connect'.cyan + ' - ' + socket.id.cyan )

		    let project = null

		    socket.on( 'start_project', ( data ) =>
		    {
		    	project = this.projects.create_project( data.slug )
		    	console.log( util.inspect( project, { depth: null, colors: true } ) )
		    } )

		    socket.on( 'update_file', ( data ) =>
		    {
		    	project.update_file( data.path, data.content )
		    	console.log( util.inspect( project, { depth: null, colors: true } ) )
		    } )

		    socket.on( 'create_file', ( data ) =>
		    {
		    	project.create_file( data.path, data.content )
		    	console.log( util.inspect( project, { depth: null, colors: true } ) )
		    } )

		    socket.on( 'delete_file', ( data ) =>
		    {
		    	project.delete_file( data.path )
		    	console.log( util.inspect( project, { depth: null, colors: true } ) )
		    } )

		    socket.on( 'create_folder', ( data ) =>
		    {
		    	project.create_folder( data.path, data.content )
		    	console.log( util.inspect( project, { depth: null, colors: true } ) )
		    } )

		    socket.on( 'delete_folder', ( data ) =>
		    {
		    	project.delete_folder( data.path )
		    	console.log( util.inspect( project, { depth: null, colors: true } ) )
		    } )
		} )
	}
}

module.exports = App
