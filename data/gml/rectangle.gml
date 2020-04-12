<?xml version="1.0" encoding="UTF-8" ?>
<gml:FeatureCollection gml:id="fcollection"
	xmlns:gml="http://www.opengis.net/gml/3.2" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
	xmlns:xlink="http://www.w3.org/1999/xlink" xmlns:hale="eu:esdihumboldt:hale:test"
	xsi:schemaLocation="eu:esdihumboldt:hale:test geom-gml32.xsd http://www.opengis.net/gml/3.2 http://schemas.opengis.net/gml/3.2.1/gml.xsd">
	<gml:boundedBy>
		<gml:Null></gml:Null>
	</gml:boundedBy>
	<gml:featureMember>
		<hale:RectangleProperty gml:id="first">
			<hale:geometry>
				<gml:exterior>
					<gml:LinearRing>
						<gml:coordinates>0.01,3.2 3.33,3.33 0.01,-3.2 -3.33,-3.2 0.01,3.2</gml:coordinates>
					</gml:LinearRing>
				</gml:exterior>
			</hale:geometry>
		</hale:RectangleProperty>
	</gml:featureMember>
	<gml:featureMember>
		<hale:RectangleProperty gml:id="second">
			<hale:geometry>
				<gml:exterior>
					<gml:Ring>
						<gml:curveMember>
							<gml:Curve>
								<gml:segments>
									<gml:LineStringSegment>
										<gml:coordinates>0.01,3.2 3.33,3.33 0.01,-3.2 -3.33,-3.2 0.01,3.2</gml:coordinates>
									</gml:LineStringSegment>
								</gml:segments>
							</gml:Curve>
						</gml:curveMember>
					</gml:Ring>
				</gml:exterior>
			</hale:geometry>
		</hale:RectangleProperty>
	</gml:featureMember>
</gml:FeatureCollection>
