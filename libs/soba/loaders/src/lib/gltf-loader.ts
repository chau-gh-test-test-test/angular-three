import { Injector, Signal } from '@angular/core';
import { NgtLoaderResults, NgtObjectMap, injectLoader } from 'angular-three';
import { assertInjector } from 'ngxtension/assert-injector';
import { Loader } from 'three';
import { DRACOLoader, GLTF, GLTFLoader, MeshoptDecoder } from 'three-stdlib';

let dracoLoader: DRACOLoader | null = null;
let decoderPath = 'https://www.gstatic.com/draco/versioned/decoders/1.5.5/';

function _extensions(useDraco: boolean | string, useMeshOpt: boolean, extensions?: (loader: GLTFLoader) => void) {
	return (loader: Loader) => {
		if (extensions) {
			extensions(loader as GLTFLoader);
		}

		if (useDraco) {
			if (!dracoLoader) {
				dracoLoader = new DRACOLoader();
			}

			dracoLoader.setDecoderPath(typeof useDraco === 'string' ? useDraco : decoderPath);
			(loader as GLTFLoader).setDRACOLoader(dracoLoader);
		}
		if (useMeshOpt) {
			(loader as GLTFLoader).setMeshoptDecoder(
				typeof MeshoptDecoder === 'function' ? MeshoptDecoder() : MeshoptDecoder,
			);
		}
	};
}

export type NgtsGLTF<T extends Partial<NgtObjectMap>> = GLTF & NgtObjectMap & T;

function _injectGLTFLoader<TUrl extends string | string[] | Record<string, string>>(
	path: () => TUrl,
	{
		useDraco = true,
		useMeshOpt = true,
		injector,
		extensions,
	}: {
		useDraco?: boolean | string;
		useMeshOpt?: boolean;
		injector?: Injector;
		extensions?: (loader: GLTFLoader) => void;
	} = {},
): Signal<NgtLoaderResults<TUrl, GLTF & NgtObjectMap> | null> {
	return assertInjector(_injectGLTFLoader, injector, () =>
		injectLoader(() => GLTFLoader, path, { extensions: _extensions(useDraco, useMeshOpt, extensions) }),
	) as Signal<NgtLoaderResults<TUrl, GLTF & NgtObjectMap> | null>;
}

_injectGLTFLoader.preload = <TUrl extends string | string[] | Record<string, string>>(
	path: () => TUrl,
	{
		useDraco = true,
		useMeshOpt = true,
		extensions,
	}: { useDraco?: boolean | string; useMeshOpt?: boolean; extensions?: (loader: GLTFLoader) => void } = {},
) => {
	injectLoader.preload(() => GLTFLoader, path, _extensions(useDraco, useMeshOpt, extensions) as any);
};

_injectGLTFLoader.setDecoderPath = (path: string) => {
	decoderPath = path;
};

export type NgtsGLTFLoader = typeof _injectGLTFLoader;
export const injectGLTFLoader: NgtsGLTFLoader = _injectGLTFLoader;