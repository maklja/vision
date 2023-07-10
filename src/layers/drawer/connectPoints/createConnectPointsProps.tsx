import { CheckIconDrawer, CloseIconDrawer, ConnectPointsOptions } from '../../../drawers';
import { ConnectPointType, ElementType, calcConnectPointVisibility } from '../../../model';

const createDefaultElementProps = (elType: ElementType): ConnectPointsOptions => {
	const { inputVisible, eventsVisible, outputVisible } = calcConnectPointVisibility(elType);
	return {
		left: {
			type: ConnectPointType.Input,
			visible: inputVisible,
		},
		right: {
			type: ConnectPointType.Output,
			visible: outputVisible,
		},
		top: {
			type: ConnectPointType.Event,
			visible: eventsVisible,
		},
		bottom: {
			type: ConnectPointType.Event,
			visible: eventsVisible,
		},
	};
};

const createIifOperatorProps = (elType: ElementType): ConnectPointsOptions => {
	const { inputVisible, eventsVisible, outputVisible } = calcConnectPointVisibility(elType);
	return {
		left: {
			type: ConnectPointType.Input,
			visible: inputVisible,
		},
		right: {
			type: ConnectPointType.Output,
			visible: outputVisible,
		},
		top: {
			type: ConnectPointType.Event,
			visible: eventsVisible,
			createIcon: (props) => <CheckIconDrawer {...props} />,
		},
		bottom: {
			type: ConnectPointType.Event,
			visible: eventsVisible,
			createIcon: (props) => <CloseIconDrawer {...props} />,
		},
	};
};

export const createConnectPointsProps = (elType: ElementType) => {
	switch (elType) {
		case ElementType.IIf:
			return createIifOperatorProps(elType);
		default:
			return createDefaultElementProps(elType);
	}
};

