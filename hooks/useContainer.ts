import useSWR from "swr"
import * as agilitySDK from "@agility/management-sdk"

interface Props {
	token: string | null | undefined
	guid: string | null | undefined
	referenceName: string | null | undefined
}


export default function useContainer({ token, guid, referenceName }: Props) {


	const key = `/api/get-container-${guid}-${referenceName}`
	const { data, error, isLoading } = useSWR(key, async () => {

		if (!guid || !token || !referenceName) return null

		let options = new agilitySDK.Options()
		options.token = token

		const api = new agilitySDK.ApiClient(options)
		const container = await api.containerMethods.getContainerByReferenceName(referenceName, guid)
		console.log("container", container)
		if (container && (container.contentDefinitionID || 0) > 0) {

			//get the model to detemine the columns if they aren't set by default...
			const model = await api.modelMethods.getContentModel(container.contentDefinitionID || 0, guid)
			console.log("model", model)
			if (model) {
				const firstTextField = model.fields.find(f => f.type === "Text")
				if (firstTextField) {
					container.columns = [
						{ fieldName: firstTextField.name, label: firstTextField.label, sortOrder: null, isDefaultSort: null, sortDirection: null, typeName: null }
					]
				}
			}

			if (!container.columns || container.columns.length === 0) {
				//fall back to the title field
				container.columns = [
					{ fieldName: "title", label: "Title", sortOrder: null, isDefaultSort: null, sortDirection: null, typeName: null },
				]
			}

			container.columns = container.columns.concat([
				{ fieldName: "state", label: "State", sortOrder: null, isDefaultSort: null, sortDirection: null, typeName: null },
				{ fieldName: "createddate", label: "Modified On", sortOrder: null, isDefaultSort: null, sortDirection: null, typeName: null },
				{ fieldName: "username", label: "Modified By", sortOrder: null, isDefaultSort: null, sortDirection: null, typeName: null },
			])
		}

		return container


	})

	return {
		data,
		isLoading,
		error
	}

}