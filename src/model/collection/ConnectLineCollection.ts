import { ConnectLine } from '../connectLine';

export class ConnectLineCollection {
	private _connectLinesPath: ReadonlyMap<string, readonly ConnectLine[]> | null = null;

	constructor(public readonly connectLines: ReadonlyMap<string, ConnectLine>) {}

	get connectLinesPath() {
		if (!this._connectLinesPath) {
			this._connectLinesPath = this.createConnectLinePath();
		}

		return this._connectLinesPath;
	}

	private createConnectLinePath(): ReadonlyMap<string, readonly ConnectLine[]> {
		return [...this.connectLines.values()].reduce((map, cl) => {
			const cls = map.get(cl.source.id) ?? [];
			return map.set(cl.source.id, [...cls, cl]);
		}, new Map<string, ConnectLine[]>());
	}
}
