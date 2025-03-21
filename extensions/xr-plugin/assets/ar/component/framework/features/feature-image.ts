/*
Xiamen Yaji Software Co., Ltd., (the “Licensor”) grants the user (the “Licensee”) non-exclusive and non-transferable rights
to use the software according to the following conditions:

a.  The Licensee shall pay royalties to the Licensor, and the amount of those royalties and the payment method are subject
    to separate negotiations between the parties.
b.  The software is licensed for use rather than sold, and the Licensor reserves all rights over the software that are not
    expressly granted (whether by implication, reservation or prohibition).
c.  The open source codes contained in the software are subject to the MIT Open Source Licensing Agreement (see the attached
    for the details);
d.  The Licensee acknowledges and consents to the possibility that errors may occur during the operation of the software for
    one or more technical reasons, and the Licensee shall take precautions and prepare remedies for such events. In such
    circumstance, the Licensor shall provide software patches or updates according to the agreement between the two parties.
    The Licensor will not assume any liability beyond the explicit wording of this  Licensing Agreement.
e.  Where the Licensor must assume liability for the software according to relevant laws, the Licensor’s entire liability is
    limited to the annual royalty payable by the Licensee.
f.  The Licensor owns the portions listed in the root directory and subdirectory (if any) in the software and enjoys the
    intellectual property rights over those portions. As for the portions owned by the Licensor, the Licensee shall not:
    i.  Bypass or avoid any relevant technical protection measures in the products or services;
    ii. Release the source codes to any other parties;
    iii.Disassemble, decompile, decipher, attack, emulate, exploit or reverse-engineer these portion of code;
    iv. Apply it to any third-party products or services without Licensor’s permission;
    v.  Publish, copy, rent, lease, sell, export, import, distribute or lend any products containing these portions of code;
    vi. Allow others to use any services relevant to the technology of these codes; and
    vii.Conduct any other act beyond the scope of this Licensing Agreement.
g.  This Licensing Agreement terminates immediately if the Licensee breaches this Agreement. The Licensor may claim
    compensation from the Licensee where the Licensee’s breach causes any damage to the Licensor.
h.  The laws of the People's Republic of China apply to this Licensing Agreement.
i.  This Agreement is made in both Chinese and English, and the Chinese version shall prevail the event of conflict.
*/

import { _decorator } from 'cc';
import { ARImageAsset, ARLibImageData, FeatureType, ImageFeatureEventParam, ImageTrackingConfig } from '../utils/ar-defines';
import { ARFeatureBase } from './feature-base';

interface FeatureImageAssetData {
    uuid: string;
    asset: ARImageAsset;
}

const { ccclass, property } = _decorator;

@ccclass('cc.ARFeatureImage')
export class ARFeatureImage extends ARFeatureBase {
    @property({ serializable: true })
    protected _maxTrackingNumber = 1;

    @property({ serializable: true, visible: false })
    protected _imageAssets: FeatureImageAssetData[] = [];

    protected _imageTrackingSet: Map<string, Array<ARImageAsset>> = new Map<string, Array<ARImageAsset>>();

    protected _config: ImageTrackingConfig | null = null;

    constructor () {
        super();
        this.type = FeatureType.ImageTracking;
        this.isShowTrackingList = true;
        this.resetConfig();
    }

    @property({
        displayOrder: 4,
        step: 1,
        tooltip: 'i18n:xr-plugin.feature.image.maxTrackingNumber',
        })
    set max_Tracking_Number (val) {
        if (val === this._maxTrackingNumber) {
            return;
        }
        this._maxTrackingNumber = val;
    }
    get max_Tracking_Number () {
        return this._maxTrackingNumber;
    }

    public resetConfig () {
        super.resetConfig();
        this._config = {
            type: this.type,
            enable: false,
            arLibImages: [],
            maxTrackingNumber: 1,
            enableNativeFallBack: false,
            enableWebFallBack: false,
        };
    }

    public getConfig () {
        this._config = {
            type: this.type,
            enable: this.enable,
            arLibImages: this.getImageAssets(),
            maxTrackingNumber: this._maxTrackingNumber,
            enableNativeFallBack: this.getNativeFallBack(),
            enableWebFallBack: this.getWebFallBack(),
        };
        return this._config;
    }

    private getImageAssets () {
        const libImageData: ARLibImageData [] = [];
        this._imageAssets.forEach((element) => {
            libImageData.push({
                assetPath: element.asset.imageAsset.nativeUrl,
                widthInMeters: element.asset.widthInMeters,
                heightInMeters: element.asset.heightInMeters,
                name: element.asset.imageAsset._uuid,
            });
        });
        return libImageData;
    }

    public getImageAssetsIndex (uuid: string, url: string) {
        for (let index = 0; index < this._imageAssets.length; index++) {
            const e = this._imageAssets[index];
            if (e.uuid === uuid && e.asset.imageAsset.nativeUrl === url) {
                return index;
            }
        }
        return -1;
    }

    public updateFeature (event: ImageFeatureEventParam) {
        super.updateFeature(event);

        if (event.canUse) {
            this._imageTrackingSet.set(event.uuid, event.images);
        } else {
            this._imageTrackingSet.delete(event.uuid);
        }

        this._imageAssets = [];
        this._imageTrackingSet.forEach((value: Array<ARImageAsset>, key: string, map: Map<string, Array<ARImageAsset>>) => {
            value.forEach((element) => {
                this._imageAssets.push({ uuid: key, asset: element });
            });
        });
    }
}
