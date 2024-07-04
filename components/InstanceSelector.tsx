import useCurrentUser from "@/hooks/useCurrentUser"
import {useMemo} from "react"
import {WebsiteAccess} from "@/types/AgilityUser"
import {DynamicIcon} from "@agility/plenum-ui"

interface ReturnValue {
	guid: string
}
interface Props {
	token: string
	onSelect: (retVal: ReturnValue) => void
}

interface Org {
	orgCode: string
	orgName: string
	instances: WebsiteAccess[]
}

export const InstanceSelector = ({token, onSelect}: Props) => {
	const {data: user, error, isLoading} = useCurrentUser({token})

	const orgs = useMemo(() => {
		let lst: Org[] = []
		if (!user) return lst

		user.websiteAccess.forEach((wa) => {
			const orgCode = wa.orgCode
			const thisOrg = lst.find((org) => org.orgCode === orgCode)
			if (!thisOrg) {
				lst.push({
					orgCode,
					orgName: wa.orgName,
					instances: [wa],
				})
			} else {
				thisOrg.instances.push(wa)
			}
		})

		return lst
	}, [user])

	if (isLoading) {
		return <div>Loading your instances...</div>
	}

	return (
		<div className="h-full flex flex-col">
			<h2 className="text-lg font-bold py-3 ">Choose which instance you want to select content from:</h2>
			<div className="flex-1 min-h-0 overflow-auto pr-3">
				{orgs.map((org) => (
					<div key={org.orgCode} className="relative">
						<div className="sticky top-0 z-10 border-y border-b-gray-200 border-t-gray-100 bg-gray-50 px-3 py-1.5 text-sm font-semibold leading-6 text-gray-900">
							<h3 className="font-bold">{org.orgName}</h3>
						</div>

						<ul role="list" className="grid grid-cols-3 gap-6 sm:grid-cols-3 lg:grid-cols-6 my-4">
							{org.instances.map((inst) => (
								<li key={inst.guid} className="col-span-1 divide-y divide-gray-200 rounded-lg bg-white shadow">
									<div className="flex w-full items-center justify-between space-x-6 p-6">
										<DynamicIcon
											icon="IconSitemap"
											outline
											className="h-10 w-10 flex-shrink-0 rounded-full bg-gray-300 p-2 text-gray-600"
										/>
										<div className="flex-1 truncate">
											<div className="flex items-center space-x-3">
												<h3 className="truncate text-sm font-medium text-gray-900">
													{inst.displayName || inst.websiteName}
												</h3>
											</div>
											{/* <p className="mt-1 truncate text-sm text-gray-500">{person.title}</p> */}
										</div>

										{/* <img className="h-10 w-10 flex-shrink-0 rounded-full bg-gray-300" src={person.imageUrl} alt="" /> */}
									</div>
									<div>
										<div className="-mt-px flex divide-x divide-gray-200">
											<div className="-ml-px flex w-0 flex-1">
												<button
													className="relative inline-flex w-0 flex-1 items-center justify-center gap-x-3 rounded-br-lg border border-transparent py-4 text-sm font-semibold text-gray-900 hover:bg-gray-100 transition-all"
													onClick={() => onSelect({guid: inst.guid})}
												>
													<DynamicIcon icon="IconCheck" className="h-5 w-5 text-gray-400" aria-hidden="true" />
													Select
												</button>
											</div>
										</div>
									</div>
								</li>
							))}
						</ul>
					</div>
				))}
			</div>
		</div>
	)
}
