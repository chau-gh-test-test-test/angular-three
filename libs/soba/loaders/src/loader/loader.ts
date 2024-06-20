import {
	ChangeDetectionStrategy,
	Component,
	ElementRef,
	computed,
	effect,
	input,
	signal,
	untracked,
	viewChild,
} from '@angular/core';
import { mergeInputs } from 'ngxtension/inject-inputs';
import { injectNgtsProgress } from '../progress/progress';

const defaultDataInterpolation = (p: number) => `Loading ${p.toFixed(2)}%`;

export interface NgtsLoaderState {
	containerClass?: string;
	innerClass?: string;
	barClass?: string;
	dataClass?: string;
	dataInterpolation: (value: number) => string;
	initialState: (value: boolean) => boolean;
}

const defaultOptions: NgtsLoaderState = {
	containerClass: '',
	innerClass: '',
	barClass: '',
	dataClass: '',
	dataInterpolation: defaultDataInterpolation,
	initialState: (value) => value,
};

@Component({
	selector: 'ngts-loader',
	standalone: true,
	template: `
		@if (shown()) {
			<div
				class="ngts-loader-container"
				[class]="containerClass() || ''"
				[style.--ngts-loader-container-opacity]="active() ? 1 : 0"
			>
				<div>
					<div class="ngts-loader-inner" [class]="innerClass() || ''">
						<div
							class="ngts-loader-bar"
							[class]="barClass() || ''"
							[style.--ngts-loader-bar-scale]="progress() / 100"
						></div>
						<span #progressSpanRef class="ngts-loader-data" [class]="dataClass() || ''"></span>
					</div>
				</div>
			</div>
		}
	`,
	styleUrls: ['./loader.css'],
	changeDetection: ChangeDetectionStrategy.OnPush,
})
export class NgtsLoader {
	private progressState = injectNgtsProgress();

	active = computed(() => this.progressState().active);
	progress = computed(() => this.progressState().progress);

	options = input(defaultOptions, { transform: mergeInputs(defaultOptions) });

	containerClass = computed(() => this.options().containerClass);
	innerClass = computed(() => this.options().innerClass);
	barClass = computed(() => this.options().barClass);
	dataClass = computed(() => this.options().dataClass);
	initialState = computed(() => this.options().initialState);
	dataInterpolation = computed(() => this.options().dataInterpolation);

	progressSpanRef = viewChild<ElementRef<HTMLSpanElement>>('progressSpanRef');

	shown = signal(this.initialState()(this.active()));

	constructor() {
		this.setShown();
		this.updateProgress();
	}

	private setShown() {
		effect((onCleanup) => {
			const [active, lastShown] = [this.active(), untracked(this.shown)];
			if (lastShown !== active) {
				const timeoutId = setTimeout(() => {
					this.shown.set(active);
				}, 300);
				onCleanup(() => clearTimeout(timeoutId));
			}
		});
	}

	private updateProgress() {
		let progressRef = 0;
		let rafId: ReturnType<typeof requestAnimationFrame>;

		effect((onCleanup) => {
			const [dataInterpolation, progress] = [this.dataInterpolation(), this.progress()];
			const updateProgress = () => {
				const progressSpan = this.progressSpanRef()?.nativeElement;
				if (!progressSpan) return;
				progressRef += (progress - progressRef) / 2;
				if (progressRef > 0.95 * progress || progress === 100) progressRef = progress;
				progressSpan.innerText = dataInterpolation(progressRef);
				if (progressRef < progress) {
					rafId = requestAnimationFrame(updateProgress);
				}
			};
			updateProgress();
			onCleanup(() => cancelAnimationFrame(rafId));
		});
	}
}