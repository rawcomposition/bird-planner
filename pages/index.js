import * as React from "react";
import Sidebar from "../components/sidebar";
import SpeciesList from "../components/species-list";
import Skeleton from "../components/skeleton";
import Timeago from "../components/timeago";
import { reducer, initialState } from "../reducer";
import { useUser } from "../providers/user";
import { saveSeenSpecies, fetchSeenSpecies } from "../firebase";
import useSyncLocalhost from "../hooks/use-sync-localhost";
import LocationSelect from "../components/location-select";
import useFetchSpecies from "../hooks/use-fetch-species";
import AnimatedArrow from "../components/animated-arrow";
import NoResults from "../components/no-results";
import FetchError from "../components/fetch-error";
import usePostProcessSpecies from "../hooks/use-post-process-species";
import CogIcon from "../icons/cog";

export default function Home() {
	const [state, dispatch] = React.useReducer(reducer, initialState);
	const { address, radius, species, expanded, seen, showSeen, isCacheRestored, showSidebar } = state;
	const { lat, lng } = address || {};

	const { user } = useUser();

	useSyncLocalhost({dispatch, seen, showSeen, address, radius});

	React.useEffect(() => {
		const getData = async () => {
			const seen = await fetchSeenSpecies();
			if (seen.length) {
				dispatch({ type: "set_seen", payload: seen || [] });
			}
		}
		if (user?.uid) {
			getData();
		}
	}, [user?.uid]);

	const handleToggleExpand = (code) => {
		dispatch({ type: "expand_toggle", payload: code }); 
	}

	const addSeenSpecies = (code) => {
		dispatch({ type: "add_seen", payload: code });
		saveSeenSpecies([...seen, code]);
	}

	const removeSeenSpecies = (code) => {
		dispatch({ type: "remove_seen", payload: code });
		saveSeenSpecies(seen.filter(value => value !== code));
	}

	const handleAddressChange = React.useCallback((value) => {
		dispatch({ type: "set_address", payload: value });
	}, []);

	const handleFilterChange = (field, value) => {
		dispatch({ type: "filter_change", payload: { field, value } });
	}

	const { loading, error, lastUpdate, call } = useFetchSpecies({ lat, lng, radius, onCallback: (response) => {
		dispatch({ type: "set_species", payload: response })
	 }});

	 React.useEffect(() => {
		if (lat && lng) {
			call();
		}
	}, [lat, lng, radius, call]);

	const { seenCount, filteredSpecies } = usePostProcessSpecies({species, expanded, seen, showSeen});

	const showWelcome = (!lat || !lng) && isCacheRestored;
	const showNoResults = lat && lng && !loading && species !== null && filteredSpecies?.length === 0 && ! error;

	return (
		<div className="flex h-screen">
			<Sidebar seenCount={seenCount} filters={{ showSeen, radius }} open={showSidebar} onFilterChange={handleFilterChange} onLogout={() => dispatch({ type: "reset" })}/>
			<div className="h-screen overflow-auto grow pt-6 px-4" onClick={showSidebar ? () => dispatch({ type: "toggle_sidebar" }) : null}>
				{isCacheRestored && <div className="container mx-auto max-w-xl">
					{showWelcome &&
						<div className="text-center flex flex-col gap-2 my-6">
							<h3 className="text-3xl font-bold text-slate-500 text-shadow">Looking for rare birds?</h3>
							<p className="text-gray-500 font-bold">Enter a location to get started</p>
							<AnimatedArrow/>
						</div>
					}

					<div className="flex">
						<LocationSelect className="w-full mt-6" value={address} onChange={handleAddressChange}/>
						<button type="button" className="text-2xl text-slate-700 px-5 md:hidden" onClick={() => dispatch({type: "toggle_sidebar"})}>
							<CogIcon/>
						</button>
					</div>

					<br/>

					{error && <FetchError reload={call}/>}
					{loading &&
						<div className="flex flex-col gap-4">
							<Skeleton count={3}/>
						</div>
					}
					{showNoResults && <NoResults reload={call}/>}

					<SpeciesList items={filteredSpecies} onToggleExpand={handleToggleExpand} onAddSeen={addSeenSpecies} onRemoveSeen={removeSeenSpecies} lat={lat} lng={lng}/>

					{filteredSpecies?.length > 0 &&
						<div className="flex justify-between mb-4">
							<span className="text-xs text-gray-500">Showing {filteredSpecies.length} of {species?.length} results</span>
							{lastUpdate && 
								<span className="text-xs text-gray-500">
									Updated <Timeago datetime={lastUpdate}/>&nbsp;-&nbsp;
									<button type="button" className="text-blue-900" onClick={call}>Reload</button>
								</span>
							}
						</div>
					}
				</div>}
			</div>
		</div>
	)
}