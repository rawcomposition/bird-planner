export default function reducer(state, action) {
	const { type, payload } = action;
	const { species, expanded, seen, states, showSeen } = state;
	switch (type) {
		case "set_species": {
			return { ...state, species: payload };
		}
		case "set_states": {
			return { ...state, states: payload };
		}
		case "set_seen": {
			return { ...state, seen: payload };
		}
		case "set_showSeen": {
			return { ...state, showSeen: payload };
		}
		case "set_address": {
			return { ...state, address: payload };
		}
		case "add_seen": {
			return { ...state, seen: [...seen, payload] };
		}
		case "expand_toggle": {
			const code = payload;
			if (state.expanded.includes(code)) {
				return { ...state, expanded: expanded.filter(value => value !== code) }
				
			} else {
				return { ...state, expanded: [...expanded, code] };
			}
		}
		case "filter_change": {
			const { field, value } = payload;
			if (field === "showSeen") {
				return { ...state, showSeen: ! showSeen }
			} else {
				return { ...state, [field]: value };
			}
		}
		default: {
			throw "Invalid reducer action";
		}
	}
}
