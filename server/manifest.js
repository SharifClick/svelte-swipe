const manifest = {
	appDir: "_app",
	appPath: "_app",
	assets: new Set(["favicon.png","images/1.jpg","images/2.jpg","images/3.jpg","images/4.jpg","images/5.jpg","images/dy-1.jpg","images/dy-2.jpg","images/dy-3.jpg","images/dy-4.jpg","images/dy-5.jpg","images/url-code.png"]),
	mimeTypes: {".png":"image/png",".jpg":"image/jpeg"},
	_: {
		entry: {"file":"_app/immutable/start-b707973a.js","imports":["_app/immutable/start-b707973a.js","_app/immutable/chunks/index-074f1e0d.js","_app/immutable/chunks/singletons-5669f1a0.js"],"stylesheets":[],"fonts":[]},
		nodes: [
			() => import('./chunks/0-4879aefe.js'),
			() => import('./chunks/1-9accd818.js'),
			() => import('./chunks/2-8c893f6c.js')
		],
		routes: [
			{
				id: "/",
				pattern: /^\/$/,
				params: [],
				page: { layouts: [0], errors: [1], leaf: 2 },
				endpoint: null
			}
		],
		matchers: async () => {
			
			return {  };
		}
	}
};

const prerendered = new Set(["/"]);

export { manifest, prerendered };
//# sourceMappingURL=manifest.js.map
